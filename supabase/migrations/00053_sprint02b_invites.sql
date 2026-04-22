-- Sprint-02b · tenant-admin · invitaciones email+token
-- ADR-0009 (decisions-log). Numeración segura: v2 va hasta 00052.
-- Solo CREA objetos nuevos (tabla invites + 3 RPCs + RLS + índices). No modifica schema existente.
--
-- Aplicar en Supabase Dashboard → SQL editor → Run.

begin;

-- ─── 1. Tabla invites ─────────────────────────────────────────────────────────

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  email text not null check (char_length(email) between 3 and 255),
  role public.app_role not null,
  token_hash text not null unique,   -- sha256 del token plano (32 bytes → 64 hex chars)
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  accepted_at timestamptz null,
  accepted_by uuid null references auth.users(id) on delete set null,
  revoked_at timestamptz null,
  constraint invites_email_lowercase check (email = lower(email)),
  constraint invites_not_both_accepted_and_revoked check (
    not (accepted_at is not null and revoked_at is not null)
  )
);

-- Índice parcial: solo UN invite pendiente por (hotel, email) a la vez.
create unique index if not exists invites_pending_unique
  on public.invites (hotel_id, email)
  where accepted_at is null and revoked_at is null;

create index if not exists invites_hotel_id_idx on public.invites (hotel_id);
create index if not exists invites_tenant_id_idx on public.invites (tenant_id);
create index if not exists invites_email_idx on public.invites (email);

-- ─── 2. RLS ───────────────────────────────────────────────────────────────────

alter table public.invites enable row level security;

-- Admin/direction/superadmin del hotel ven los invites del hotel.
create policy "invites_select_admin"
  on public.invites
  for select
  using (
    public.is_member_of(hotel_id)
    and public.get_member_role(hotel_id) in ('superadmin', 'direction', 'admin')
  );

-- Solo los RPCs SECURITY DEFINER pueden insertar/mutar. No exponemos INSERT/UPDATE directo.
-- Para mayor claridad, no creamos policies INSERT/UPDATE/DELETE: sin policy = acceso denegado.

-- ─── 3. RPC create_invite ─────────────────────────────────────────────────────

create or replace function public.create_invite(
  p_hotel_id uuid,
  p_email text,
  p_role public.app_role
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_caller uuid := auth.uid();
  v_tenant_id uuid;
  v_token text;
  v_token_hash text;
  v_invite_id uuid;
  v_expires_at timestamptz;
  v_normalized_email text := lower(trim(p_email));
begin
  -- Primera línea: autorización
  perform public.check_membership(
    v_caller,
    p_hotel_id,
    array['superadmin','direction','admin']::public.app_role[]
  );

  if v_caller is null then
    raise exception 'auth_required' using errcode = 'P0001';
  end if;
  if v_normalized_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email: %', v_normalized_email using errcode = 'P0001';
  end if;

  -- Tenant del hotel (requerido para fk y para emit_event)
  select tenant_id into v_tenant_id from public.hotels where id = p_hotel_id;
  if v_tenant_id is null then
    raise exception 'hotel_not_found' using errcode = 'P0002';
  end if;

  -- Si el email ya es miembro activo → rechazar
  if exists (
    select 1
    from public.memberships m
    join auth.users u on u.id = m.user_id
    where m.hotel_id = p_hotel_id
      and lower(u.email) = v_normalized_email
      and m.is_active = true
  ) then
    raise exception 'already_member' using errcode = 'P0001';
  end if;

  -- Token plano = 32 bytes random → base64url (URL-safe)
  v_token := replace(replace(translate(encode(gen_random_bytes(32), 'base64'), E'\n', ''), '+', '-'), '/', '_');
  v_token := rtrim(v_token, '=');
  v_token_hash := encode(digest(v_token, 'sha256'), 'hex');
  v_expires_at := now() + interval '7 days';

  insert into public.invites (
    hotel_id, tenant_id, email, role, token_hash, expires_at, created_by
  ) values (
    p_hotel_id, v_tenant_id, v_normalized_email, p_role, v_token_hash, v_expires_at, v_caller
  )
  returning id into v_invite_id;

  -- Emit domain event (tolerante si emit_event no existe: no fallar el insert).
  begin
    perform public.emit_event(
      'member.invited',
      p_hotel_id,
      v_tenant_id,
      jsonb_build_object(
        'invite_id', v_invite_id,
        'email', v_normalized_email,
        'role', p_role::text,
        'created_by', v_caller
      )
    );
  exception when undefined_function then
    -- emit_event no existe en este proyecto → skip silencioso
    null;
  end;

  return jsonb_build_object(
    'invite_id', v_invite_id,
    'token', v_token,             -- PLANO: devuelto SOLO en esta respuesta
    'email', v_normalized_email,
    'role', p_role::text,
    'expires_at', v_expires_at,
    'hotel_id', p_hotel_id
  );
end $$;

grant execute on function public.create_invite(uuid, text, public.app_role) to authenticated;

-- ─── 4. RPC accept_invite (EXCEPCIÓN ADR-0009 a check_membership) ─────────────

create or replace function public.accept_invite(
  p_token text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_caller uuid := auth.uid();
  v_caller_email text;
  v_token_hash text;
  v_invite record;
begin
  -- ADR-0009: NO check_membership (el caller aún no es miembro).
  -- Validación equivalente: auth + token + expiración + email match.
  if v_caller is null then
    raise exception 'auth_required' using errcode = 'P0001';
  end if;

  select lower(email) into v_caller_email from auth.users where id = v_caller;
  if v_caller_email is null then
    raise exception 'user_email_missing' using errcode = 'P0001';
  end if;

  v_token_hash := encode(digest(p_token, 'sha256'), 'hex');

  select * into v_invite
  from public.invites
  where token_hash = v_token_hash;

  if v_invite is null then
    raise exception 'invite_not_found' using errcode = 'P0002';
  end if;
  if v_invite.revoked_at is not null then
    raise exception 'invite_revoked' using errcode = 'P0001';
  end if;
  if v_invite.accepted_at is not null then
    raise exception 'invite_already_accepted' using errcode = 'P0001';
  end if;
  if v_invite.expires_at <= now() then
    raise exception 'invite_expired' using errcode = 'P0001';
  end if;
  if v_invite.email <> v_caller_email then
    raise exception 'invite_email_mismatch' using errcode = 'P0001';
  end if;

  -- Crear o reactivar membership del caller en el hotel
  insert into public.memberships (user_id, hotel_id, tenant_id, role, is_active, is_default)
  values (v_caller, v_invite.hotel_id, v_invite.tenant_id, v_invite.role, true, false)
  on conflict (user_id, hotel_id)
  do update set
    role = excluded.role,
    is_active = true;

  -- Marcar invite aceptado
  update public.invites
  set accepted_at = now(),
      accepted_by = v_caller
  where id = v_invite.id;

  begin
    perform public.emit_event(
      'member.accepted',
      v_invite.hotel_id,
      v_invite.tenant_id,
      jsonb_build_object(
        'invite_id', v_invite.id,
        'user_id', v_caller,
        'role', v_invite.role::text
      )
    );
  exception when undefined_function then
    null;
  end;

  return jsonb_build_object(
    'hotel_id', v_invite.hotel_id,
    'tenant_id', v_invite.tenant_id,
    'role', v_invite.role::text
  );
end $$;

grant execute on function public.accept_invite(text) to authenticated;

-- ─── 5. RPC revoke_invite ─────────────────────────────────────────────────────

create or replace function public.revoke_invite(
  p_invite_id uuid
) returns void
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_caller uuid := auth.uid();
  v_invite record;
begin
  select * into v_invite from public.invites where id = p_invite_id;
  if v_invite is null then
    raise exception 'invite_not_found' using errcode = 'P0002';
  end if;

  -- Primera línea de autorización real (tras obtener hotel_id)
  perform public.check_membership(
    v_caller,
    v_invite.hotel_id,
    array['superadmin','direction','admin']::public.app_role[]
  );

  if v_invite.accepted_at is not null then
    raise exception 'invite_already_accepted' using errcode = 'P0001';
  end if;
  if v_invite.revoked_at is not null then
    raise exception 'invite_already_revoked' using errcode = 'P0001';
  end if;

  update public.invites
  set revoked_at = now()
  where id = p_invite_id;

  begin
    perform public.emit_event(
      'member.invite_revoked',
      v_invite.hotel_id,
      v_invite.tenant_id,
      jsonb_build_object(
        'invite_id', v_invite.id,
        'revoked_by', v_caller
      )
    );
  exception when undefined_function then
    null;
  end;
end $$;

grant execute on function public.revoke_invite(uuid) to authenticated;

-- ─── 6. RPC preview_invite (solo lectura, para /invite/[token]) ──────────────

create or replace function public.preview_invite(
  p_token text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_caller uuid := auth.uid();
  v_token_hash text;
  v_invite record;
  v_hotel_name text;
  v_tenant_name text;
begin
  -- Requiere sesión (para evitar enumeración anónima de tokens).
  if v_caller is null then
    raise exception 'auth_required' using errcode = 'P0001';
  end if;

  v_token_hash := encode(digest(p_token, 'sha256'), 'hex');

  select * into v_invite from public.invites where token_hash = v_token_hash;
  if v_invite is null then
    raise exception 'invite_not_found' using errcode = 'P0002';
  end if;

  select name into v_hotel_name from public.hotels where id = v_invite.hotel_id;
  select name into v_tenant_name from public.tenants where id = v_invite.tenant_id;

  return jsonb_build_object(
    'email', v_invite.email,
    'role', v_invite.role::text,
    'hotel_id', v_invite.hotel_id,
    'hotel_name', v_hotel_name,
    'tenant_id', v_invite.tenant_id,
    'tenant_name', v_tenant_name,
    'expires_at', v_invite.expires_at,
    'accepted_at', v_invite.accepted_at,
    'revoked_at', v_invite.revoked_at,
    'status', case
      when v_invite.accepted_at is not null then 'accepted'
      when v_invite.revoked_at is not null then 'revoked'
      when v_invite.expires_at <= now() then 'expired'
      else 'pending'
    end
  );
end $$;

grant execute on function public.preview_invite(text) to authenticated;

commit;
