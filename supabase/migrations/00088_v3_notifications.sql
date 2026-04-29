-- 00088_v3_notifications.sql
-- Sprint-12 · Notifications in-app per-user-per-hotel.
-- ADR-0024: fan-out síncrono via trigger after insert on v3_domain_events.

-- ─── Enum ────────────────────────────────────────────────────────────────────
do $enum_severity$
begin
  if not exists (select 1 from pg_type where typname = 'v3_notification_severity') then
    create type public.v3_notification_severity as enum ('info', 'success', 'warning', 'critical');
  end if;
end $enum_severity$;

-- ─── Tabla v3_notifications ─────────────────────────────────────────────────
create table if not exists public.v3_notifications (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid references public.v3_domain_events(id) on delete set null,
  category text not null check (category in (
    'compliance', 'inventory', 'production', 'procurement', 'system'
  )),
  event_type text not null,
  severity public.v3_notification_severity not null default 'info',
  title text not null,
  body text not null,
  payload jsonb not null default '{}'::jsonb,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Idempotencia fan-out: una notification por (event, user)
create unique index if not exists v3_notifications_event_user_uidx
  on public.v3_notifications (event_id, user_id)
  where event_id is not null;

create index if not exists v3_notifications_hotel_user_unread_idx
  on public.v3_notifications (hotel_id, user_id, created_at desc)
  where read_at is null;

create index if not exists v3_notifications_hotel_user_all_idx
  on public.v3_notifications (hotel_id, user_id, created_at desc);

alter table public.v3_notifications enable row level security;

drop policy if exists v3_notifications_select_self on public.v3_notifications;
create policy v3_notifications_select_self on public.v3_notifications
  for select using (user_id = (select auth.uid()));

drop policy if exists v3_notifications_update_self on public.v3_notifications;
create policy v3_notifications_update_self on public.v3_notifications
  for update using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists v3_notifications_insert_rpc_only on public.v3_notifications;
create policy v3_notifications_insert_rpc_only on public.v3_notifications
  for insert with check (false);

drop policy if exists v3_notifications_delete_never on public.v3_notifications;
create policy v3_notifications_delete_never on public.v3_notifications
  for delete using (false);

-- ─── Tabla v3_notification_preferences ──────────────────────────────────────
create table if not exists public.v3_notification_preferences (
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in (
    'compliance', 'inventory', 'production', 'procurement', 'system'
  )),
  in_app_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (hotel_id, user_id, category)
);

alter table public.v3_notification_preferences enable row level security;

drop policy if exists v3_notification_preferences_select_self on public.v3_notification_preferences;
create policy v3_notification_preferences_select_self on public.v3_notification_preferences
  for select using (user_id = (select auth.uid()));

drop policy if exists v3_notification_preferences_insert_self on public.v3_notification_preferences;
create policy v3_notification_preferences_insert_self on public.v3_notification_preferences
  for insert with check (user_id = (select auth.uid()));

drop policy if exists v3_notification_preferences_update_self on public.v3_notification_preferences;
create policy v3_notification_preferences_update_self on public.v3_notification_preferences
  for update using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop trigger if exists v3_notification_preferences_set_updated_at on public.v3_notification_preferences;
create trigger v3_notification_preferences_set_updated_at
  before update on public.v3_notification_preferences
  for each row execute function public.v3_tg_set_updated_at();

-- ─── Helper: event_type → notification metadata ─────────────────────────────
create or replace function public.v3_event_to_notification(
  p_event_type text,
  p_payload jsonb
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $fn_v3_event_to_notification$
declare
  v_all_ok boolean;
begin
  if p_event_type = 'temperature.out_of_range' then
    return jsonb_build_object(
      'category', 'compliance',
      'severity', 'critical',
      'target_roles', array['superadmin','direction','admin','head_chef','sous_chef','warehouse'],
      'title', 'Temperatura fuera de rango',
      'body', format('Equipo %s registró %s°C (rango %s°C–%s°C).',
        coalesce(p_payload ->> 'equipment_id', 'desconocido'),
        coalesce(p_payload ->> 'temperature_c', '?'),
        coalesce(p_payload ->> 'min_temperature_c', '?'),
        coalesce(p_payload ->> 'max_temperature_c', '?')),
      'link', '/compliance/temperature'
    );
  end if;

  if p_event_type = 'compliance.quality_checked' then
    v_all_ok := coalesce((p_payload ->> 'all_ok')::boolean, true);
    if v_all_ok then
      return null;
    end if;
    return jsonb_build_object(
      'category', 'compliance',
      'severity', 'warning',
      'target_roles', array['superadmin','direction','admin','head_chef','procurement'],
      'title', 'Recepción rechazada en control APPCC',
      'body', 'Una recepción no superó el control de calidad. Revisa el detalle.',
      'link', '/compliance/quality'
    );
  end if;

  if p_event_type = 'compliance.cleaning_overdue' then
    return jsonb_build_object(
      'category', 'compliance',
      'severity', 'warning',
      'target_roles', array['superadmin','direction','admin','head_chef','sous_chef'],
      'title', 'Tarea de limpieza vencida',
      'body', format('El área %s tiene una limpieza pendiente (vencimiento %s).',
        coalesce(p_payload ->> 'area_name', 'desconocida'),
        coalesce(p_payload ->> 'due_date', '?')),
      'link', '/compliance/cleaning'
    );
  end if;

  if p_event_type = 'production.completed' then
    return jsonb_build_object(
      'category', 'production',
      'severity', 'success',
      'target_roles', array['superadmin','direction','admin','head_chef','sous_chef','cook'],
      'title', 'Producción completada',
      'body', format('Orden de producción %s finalizada.',
        coalesce(p_payload ->> 'production_order_id', '?')),
      'link', '/production'
    );
  end if;

  if p_event_type = 'lot.expiring_soon' then
    return jsonb_build_object(
      'category', 'inventory',
      'severity', 'warning',
      'target_roles', array['superadmin','direction','admin','head_chef','warehouse'],
      'title', 'Lote próximo a caducar',
      'body', format('Producto %s caduca el %s.',
        coalesce(p_payload ->> 'product_name', '?'),
        coalesce(p_payload ->> 'expires_at', '?')),
      'link', '/inventory'
    );
  end if;

  return null;
end;
$fn_v3_event_to_notification$;

-- ─── Fan-out interno ────────────────────────────────────────────────────────
create or replace function public.v3__notifications_create_from_event(
  p_event_id uuid
)
returns int
language plpgsql
security definer
set search_path = public
as $fn_v3__notifications_create_from_event$
declare
  v_event public.v3_domain_events%rowtype;
  v_meta jsonb;
  v_target_roles text[];
  v_inserted_count int := 0;
begin
  select * into v_event from public.v3_domain_events where id = p_event_id;
  if v_event.id is null then return 0; end if;

  v_meta := public.v3_event_to_notification(v_event.event_type, coalesce(v_event.payload, '{}'::jsonb));
  if v_meta is null then return 0; end if;

  select array(select jsonb_array_elements_text(v_meta -> 'target_roles')) into v_target_roles;
  if v_target_roles is null or cardinality(v_target_roles) = 0 then return 0; end if;

  insert into public.v3_notifications (
    hotel_id, user_id, event_id, category, event_type, severity, title, body, payload, link
  )
  select
    v_event.hotel_id,
    m.user_id,
    v_event.id,
    v_meta ->> 'category',
    v_event.event_type,
    (v_meta ->> 'severity')::public.v3_notification_severity,
    v_meta ->> 'title',
    v_meta ->> 'body',
    coalesce(v_event.payload, '{}'::jsonb),
    v_meta ->> 'link'
  from public.v3_memberships m
  left join public.v3_notification_preferences pref
    on pref.hotel_id = v_event.hotel_id
   and pref.user_id = m.user_id
   and pref.category = (v_meta ->> 'category')
  where m.hotel_id = v_event.hotel_id
    and m.is_active = true
    and m.role::text = any (v_target_roles)
    and coalesce(pref.in_app_enabled, true) = true
  on conflict (event_id, user_id) where event_id is not null do nothing;

  get diagnostics v_inserted_count = row_count;
  return v_inserted_count;
end;
$fn_v3__notifications_create_from_event$;

-- ─── Trigger after insert on v3_domain_events ───────────────────────────────
create or replace function public.v3_tg_notify_from_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn_v3_tg_notify_from_event$
begin
  perform public.v3__notifications_create_from_event(new.id);
  return new;
end;
$fn_v3_tg_notify_from_event$;

drop trigger if exists v3_domain_events_notify_after_insert on public.v3_domain_events;
create trigger v3_domain_events_notify_after_insert
  after insert on public.v3_domain_events
  for each row execute function public.v3_tg_notify_from_event();

-- ─── RPCs user-facing ───────────────────────────────────────────────────────
create or replace function public.v3_get_notifications(
  p_hotel_id uuid,
  p_unread_only boolean default false,
  p_limit int default 50
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $fn_v3_get_notifications$
declare
  v_user uuid := auth.uid();
  v_limit int := least(coalesce(p_limit, 50), 200);
  v_rows jsonb;
begin
  perform public.v3_check_membership(auth.uid(), p_hotel_id, null);

  select coalesce(jsonb_agg(row_to_json(n)::jsonb order by n.created_at desc), '[]'::jsonb)
  into v_rows
  from (
    select n.id, n.hotel_id, n.user_id, n.event_id, n.category, n.event_type,
           n.severity, n.title, n.body, n.payload, n.link, n.read_at, n.created_at
    from public.v3_notifications n
    where n.hotel_id = p_hotel_id and n.user_id = v_user
      and (not p_unread_only or n.read_at is null)
    order by n.created_at desc
    limit v_limit
  ) n;

  return v_rows;
end;
$fn_v3_get_notifications$;

create or replace function public.v3_get_unread_notifications_count(
  p_hotel_id uuid
)
returns int
language plpgsql
stable
security definer
set search_path = public
as $fn_v3_get_unread_notifications_count$
declare
  v_user uuid := auth.uid();
  v_count int;
begin
  perform public.v3_check_membership(auth.uid(), p_hotel_id, null);

  select count(*) into v_count
  from public.v3_notifications
  where hotel_id = p_hotel_id and user_id = v_user and read_at is null;

  return coalesce(v_count, 0);
end;
$fn_v3_get_unread_notifications_count$;

create or replace function public.v3_mark_notification_read(
  p_hotel_id uuid,
  p_notification_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_mark_notification_read$
declare
  v_user uuid := auth.uid();
  v_row public.v3_notifications%rowtype;
begin
  perform public.v3_check_membership(auth.uid(), p_hotel_id, null);

  update public.v3_notifications
  set read_at = coalesce(read_at, now())
  where id = p_notification_id and hotel_id = p_hotel_id and user_id = v_user
  returning * into v_row;

  if v_row.id is null then
    raise exception 'notification not found' using errcode = 'P0010';
  end if;

  return to_jsonb(v_row);
end;
$fn_v3_mark_notification_read$;

create or replace function public.v3_mark_all_notifications_read(
  p_hotel_id uuid
)
returns int
language plpgsql
security definer
set search_path = public
as $fn_v3_mark_all_notifications_read$
declare
  v_user uuid := auth.uid();
  v_count int;
begin
  perform public.v3_check_membership(auth.uid(), p_hotel_id, null);

  update public.v3_notifications
  set read_at = now()
  where hotel_id = p_hotel_id and user_id = v_user and read_at is null;

  get diagnostics v_count = row_count;
  return v_count;
end;
$fn_v3_mark_all_notifications_read$;

create or replace function public.v3_get_notification_preferences(
  p_hotel_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $fn_v3_get_notification_preferences$
declare
  v_user uuid := auth.uid();
  v_categories text[] := array['compliance', 'inventory', 'production', 'procurement', 'system'];
  v_result jsonb := '{}'::jsonb;
  v_cat text;
  v_enabled boolean;
begin
  perform public.v3_check_membership(auth.uid(), p_hotel_id, null);

  foreach v_cat in array v_categories loop
    select coalesce(in_app_enabled, true) into v_enabled
    from public.v3_notification_preferences
    where hotel_id = p_hotel_id and user_id = v_user and category = v_cat;

    v_result := v_result || jsonb_build_object(v_cat, coalesce(v_enabled, true));
  end loop;

  return v_result;
end;
$fn_v3_get_notification_preferences$;

create or replace function public.v3_upsert_notification_preference(
  p_hotel_id uuid,
  p_category text,
  p_in_app_enabled boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_upsert_notification_preference$
declare
  v_user uuid := auth.uid();
  v_row public.v3_notification_preferences%rowtype;
begin
  perform public.v3_check_membership(auth.uid(), p_hotel_id, null);

  if p_category not in ('compliance', 'inventory', 'production', 'procurement', 'system') then
    raise exception 'invalid category: %', p_category using errcode = 'P0003';
  end if;

  insert into public.v3_notification_preferences (hotel_id, user_id, category, in_app_enabled)
  values (p_hotel_id, v_user, p_category, p_in_app_enabled)
  on conflict (hotel_id, user_id, category)
  do update set in_app_enabled = excluded.in_app_enabled, updated_at = now()
  returning * into v_row;

  return to_jsonb(v_row);
end;
$fn_v3_upsert_notification_preference$;

-- ─── Grants patrón v3 baseline ──────────────────────────────────────────────
revoke all on function public.v3_event_to_notification(text, jsonb) from public, anon, authenticated;
revoke all on function public.v3__notifications_create_from_event(uuid) from public, anon, authenticated;
revoke all on function public.v3_tg_notify_from_event() from public, anon, authenticated;

revoke all on function public.v3_get_notifications(uuid, boolean, int) from public, anon, authenticated;
grant execute on function public.v3_get_notifications(uuid, boolean, int) to authenticated;

revoke all on function public.v3_get_unread_notifications_count(uuid) from public, anon, authenticated;
grant execute on function public.v3_get_unread_notifications_count(uuid) to authenticated;

revoke all on function public.v3_mark_notification_read(uuid, uuid) from public, anon, authenticated;
grant execute on function public.v3_mark_notification_read(uuid, uuid) to authenticated;

revoke all on function public.v3_mark_all_notifications_read(uuid) from public, anon, authenticated;
grant execute on function public.v3_mark_all_notifications_read(uuid) to authenticated;

revoke all on function public.v3_get_notification_preferences(uuid) from public, anon, authenticated;
grant execute on function public.v3_get_notification_preferences(uuid) to authenticated;

revoke all on function public.v3_upsert_notification_preference(uuid, text, boolean) from public, anon, authenticated;
grant execute on function public.v3_upsert_notification_preference(uuid, text, boolean) to authenticated;
