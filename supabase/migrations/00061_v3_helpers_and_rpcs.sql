-- 00061_v3_helpers_and_rpcs.sql
-- ADR-0015 Fase 1 DB: helpers RLS v3_ + 31 RPCs v3_ + trigger price_history v3_ + policies SELECT.
-- Copiado 1:1 de los cuerpos v2 con substitución public.X → public.v3_X para:
--   tenants, hotels, memberships, profiles, invites, clients, events, event_spaces,
--   event_menus, event_operational_impact, event_versions, recipes, recipe_ingredients,
--   recipe_steps, recipe_sub_recipes, recipe_versions, menus, menu_sections,
--   menu_section_recipes, products, product_aliases, units_of_measure, suppliers,
--   supplier_configs, supplier_offers, supplier_incidents, product_supplier_refs,
--   price_history, import_runs, audit_logs, domain_events.
-- NO prefijar: auth.users (Supabase global).

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 1 — helpers RLS v3_
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function public.v3_is_member_of(p_hotel_id uuid)
returns boolean
language sql stable security definer
as $$
  select exists (
    select 1 from public.v3_memberships
    where user_id = auth.uid()
      and hotel_id = p_hotel_id
      and is_active = true
  );
$$;

create or replace function public.v3_get_member_role(p_hotel_id uuid)
returns public.v3_app_role
language sql stable security definer
as $$
  select role from public.v3_memberships
  where user_id = auth.uid()
    and hotel_id = p_hotel_id
    and is_active = true
  limit 1;
$$;

create or replace function public.v3_check_membership(p_user_id uuid, p_hotel_id uuid, p_required_roles public.v3_app_role[] default null)
returns public.v3_app_role
language plpgsql security definer
as $$
declare
  v_role public.v3_app_role;
begin
  select role into v_role
  from public.v3_memberships
  where user_id = p_user_id
    and hotel_id = p_hotel_id
    and is_active = true;

  if v_role is null then
    raise exception 'unauthorized: no active membership for this hotel'
      using errcode = 'P0001';
  end if;

  if p_required_roles is not null and v_role != all(p_required_roles) then
    raise exception 'forbidden: role % not allowed for this operation', v_role
      using errcode = 'P0002';
  end if;

  return v_role;
end;
$$;

create or replace function public.v3_check_membership(p_hotel_id uuid)
returns public.v3_app_role
language sql security definer
set search_path to 'public'
as $$
  select public.v3_check_membership(auth.uid(), p_hotel_id, null);
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 2 — helpers internos v3_
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function public.v3_emit_event(
  p_hotel_id uuid,
  p_aggregate_type text,
  p_aggregate_id uuid,
  p_event_type text,
  p_payload jsonb default '{}'::jsonb,
  p_dedup_window_seconds integer default 5
)
returns uuid
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_event_id uuid;
begin
  if p_dedup_window_seconds > 0 then
    select id into v_event_id
    from public.v3_domain_events
    where hotel_id = p_hotel_id
      and aggregate_type = p_aggregate_type
      and aggregate_id = p_aggregate_id
      and event_type = p_event_type
      and created_at > now() - (p_dedup_window_seconds || ' seconds')::interval
    order by created_at desc
    limit 1;

    if v_event_id is not null then
      return v_event_id;
    end if;
  end if;

  insert into public.v3_domain_events
    (hotel_id, aggregate_type, aggregate_id, event_type, payload)
  values
    (p_hotel_id, p_aggregate_type, p_aggregate_id, p_event_type, p_payload)
  returning id into v_event_id;

  return v_event_id;
end;
$$;

create or replace function public.v3_validate_event_transition(p_from public.v3_event_status, p_to public.v3_event_status)
returns boolean
language plpgsql
as $$
begin
  if p_to = 'cancelled' and p_from not in ('completed', 'cancelled', 'archived') then
    return true;
  end if;
  if p_to = 'archived' and p_from in ('completed', 'cancelled') then
    return true;
  end if;
  return (p_from, p_to) in (
    ('draft', 'pending_confirmation'),
    ('pending_confirmation', 'confirmed'),
    ('confirmed', 'in_preparation'),
    ('in_preparation', 'in_operation'),
    ('in_operation', 'completed')
  );
end;
$$;

create or replace function public.v3_category_to_department(p_cat public.v3_recipe_category)
returns public.v3_department
language plpgsql immutable
as $$
begin
  return case p_cat
    when 'cold_starters' then 'cocina_fria'
    when 'hot_starters' then 'cocina_caliente'
    when 'soups_creams' then 'cocina_caliente'
    when 'fish' then 'cocina_caliente'
    when 'meat' then 'cocina_caliente'
    when 'sides' then 'cocina_caliente'
    when 'desserts' then 'pasteleria'
    when 'bakery' then 'panaderia'
    when 'sauces_stocks' then 'cocina_caliente'
    when 'mise_en_place' then 'general'
    when 'buffet' then 'servicio'
    when 'room_service' then 'servicio'
    when 'cocktail_pieces' then 'cocina_fria'
    else 'general'
  end::public.v3_department;
end;
$$;

create or replace function public.v3__calculate_recipe_cost_recursive(p_hotel_id uuid, p_recipe_id uuid, p_visited_ids uuid[], p_depth integer)
returns jsonb
language plpgsql security definer
as $$
declare
  v_ingredient_cost numeric(12,4) := 0;
  v_sub_recipe_cost numeric(12,4) := 0;
  v_total_cost numeric(12,4);
  v_servings integer;
  v_cost_per_serving numeric(12,4);
  v_sub record;
  v_sub_result jsonb;
begin
  if p_recipe_id = any(p_visited_ids) then
    raise exception 'circular sub-recipe dependency detected: % already visited in chain %',
      p_recipe_id, p_visited_ids
      using errcode = 'P0003';
  end if;

  if p_depth > 5 then
    raise exception 'sub-recipe nesting exceeds maximum depth of 5'
      using errcode = 'P0003';
  end if;

  select servings into v_servings
  from public.v3_recipes
  where id = p_recipe_id and hotel_id = p_hotel_id;

  if v_servings is null then
    raise exception 'sub-recipe % not found', p_recipe_id using errcode = 'P0404';
  end if;

  select coalesce(sum(quantity_net * unit_cost), 0)
  into v_ingredient_cost
  from public.v3_recipe_ingredients
  where recipe_id = p_recipe_id and hotel_id = p_hotel_id;

  for v_sub in
    select sub_recipe_id, quantity
    from public.v3_recipe_sub_recipes
    where recipe_id = p_recipe_id
  loop
    v_sub_result := public.v3__calculate_recipe_cost_recursive(
      p_hotel_id, v_sub.sub_recipe_id,
      p_visited_ids || p_recipe_id,
      p_depth + 1
    );
    v_sub_recipe_cost := v_sub_recipe_cost +
      (v_sub_result->>'cost_per_serving')::numeric * v_sub.quantity;
  end loop;

  v_total_cost := v_ingredient_cost + v_sub_recipe_cost;
  v_cost_per_serving := case when v_servings > 0 then v_total_cost / v_servings else 0 end;

  return jsonb_build_object(
    'cost_per_serving', v_cost_per_serving,
    'total_cost', v_total_cost
  );
end;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 3 — RPCs identity (3)
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function public.v3_get_active_hotel()
returns jsonb
language plpgsql security definer
as $$
declare
  v_result jsonb;
begin
  select jsonb_build_object(
    'membership_id', m.id,
    'hotel_id', h.id,
    'hotel_name', h.name,
    'hotel_slug', h.slug,
    'timezone', h.timezone,
    'currency', h.currency,
    'role', m.role,
    'tenant_id', m.tenant_id
  ) into v_result
  from public.v3_memberships m
  join public.v3_hotels h on h.id = m.hotel_id
  where m.user_id = auth.uid()
    and m.is_active = true
    and h.is_active = true
  order by m.is_default desc, m.created_at asc
  limit 1;

  if v_result is null then
    raise exception 'no active membership found'
      using errcode = 'P0003';
  end if;

  return v_result;
end;
$$;

create or replace function public.v3_get_user_hotels()
returns jsonb
language plpgsql security definer
as $$
begin
  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'membership_id', m.id,
          'hotel_id', h.id,
          'hotel_name', h.name,
          'hotel_slug', h.slug,
          'role', m.role,
          'is_default', m.is_default
        )
        order by m.is_default desc, h.name asc
      )
      from public.v3_memberships m
      join public.v3_hotels h on h.id = m.hotel_id
      where m.user_id = auth.uid()
        and m.is_active = true
        and h.is_active = true
    ),
    '[]'::jsonb
  );
end;
$$;

create or replace function public.v3_switch_active_hotel(p_hotel_id uuid)
returns void
language plpgsql security definer
as $$
begin
  perform public.v3_check_membership(auth.uid(), p_hotel_id);

  update public.v3_memberships
  set is_default = false
  where user_id = auth.uid()
    and is_default = true;

  update public.v3_memberships
  set is_default = true
  where user_id = auth.uid()
    and hotel_id = p_hotel_id
    and is_active = true;

  perform public.v3_emit_event(
    p_hotel_id,
    'membership',
    (select id from public.v3_memberships where user_id = auth.uid() and hotel_id = p_hotel_id),
    'hotel.switched',
    jsonb_build_object('user_id', auth.uid())
  );
end;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 4 — RPCs tenant-admin v2 (2)
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function public.v3_create_hotel(p_tenant_id uuid, p_name text, p_slug text, p_timezone text default 'Europe/Madrid', p_currency text default 'EUR')
returns uuid
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_hotel_id uuid;
  v_user_id  uuid := auth.uid();
begin
  if exists (select 1 from public.v3_hotels where tenant_id = p_tenant_id limit 1) then
    if not exists (
      select 1 from public.v3_memberships
      where user_id   = v_user_id
        and tenant_id = p_tenant_id
        and role      in ('superadmin', 'direction')
        and is_active = true
    ) then
      raise exception 'No tienes permiso para crear hoteles en este tenant'
        using errcode = 'P0001';
    end if;
  end if;

  insert into public.v3_hotels (tenant_id, name, slug, timezone, currency)
  values (p_tenant_id, p_name, p_slug, p_timezone, p_currency)
  returning id into v_hotel_id;

  insert into public.v3_memberships (user_id, hotel_id, tenant_id, role, is_default)
  values (v_user_id, v_hotel_id, p_tenant_id, 'admin'::public.v3_app_role, true);

  perform public.v3_emit_event(
    v_hotel_id, 'hotel', v_hotel_id, 'hotel.created',
    jsonb_build_object('name', p_name, 'created_by', v_user_id)
  );

  return v_hotel_id;
end;
$$;

create or replace function public.v3_create_tenant_with_hotel(p_tenant_name text, p_hotel_name text, p_hotel_slug text, p_timezone text default 'Europe/Madrid', p_currency text default 'EUR')
returns jsonb
language plpgsql security definer
as $$
declare
  v_tenant_id uuid;
  v_hotel_id uuid;
begin
  insert into public.v3_tenants (name)
  values (p_tenant_name)
  returning id into v_tenant_id;

  v_hotel_id := public.v3_create_hotel(v_tenant_id, p_hotel_name, p_hotel_slug, p_timezone, p_currency);

  return jsonb_build_object(
    'tenant_id', v_tenant_id,
    'hotel_id', v_hotel_id
  );
end;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 5 — RPC nueva v3_get_team_members
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function public.v3_get_team_members(p_hotel_id uuid)
returns jsonb
language plpgsql security definer
as $$
declare
  v_role public.v3_app_role;
begin
  v_role := public.v3_check_membership(auth.uid(), p_hotel_id,
    array['superadmin','direction','admin']::public.v3_app_role[]);

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'membership_id', m.id,
      'user_id', m.user_id,
      'email', u.email,
      'full_name', p.full_name,
      'role', m.role,
      'is_active', m.is_active,
      'is_default', m.is_default,
      'created_at', m.created_at
    ) order by m.is_active desc, m.created_at asc)
    from public.v3_memberships m
    join auth.users u on u.id = m.user_id
    left join public.v3_profiles p on p.id = m.user_id
    where m.hotel_id = p_hotel_id
  ), '[]'::jsonb);
end;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 6 — RPCs tenant-admin v3 (invites, 4) — copiado de 00053
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function public.v3_create_invite(
  p_hotel_id uuid,
  p_email text,
  p_role public.v3_app_role
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
  perform public.v3_check_membership(
    v_caller, p_hotel_id,
    array['superadmin','direction','admin']::public.v3_app_role[]
  );

  if v_caller is null then
    raise exception 'auth_required' using errcode = 'P0001';
  end if;
  if v_normalized_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email: %', v_normalized_email using errcode = 'P0001';
  end if;

  select tenant_id into v_tenant_id from public.v3_hotels where id = p_hotel_id;
  if v_tenant_id is null then
    raise exception 'hotel_not_found' using errcode = 'P0002';
  end if;

  if exists (
    select 1
    from public.v3_memberships m
    join auth.users u on u.id = m.user_id
    where m.hotel_id = p_hotel_id
      and lower(u.email) = v_normalized_email
      and m.is_active = true
  ) then
    raise exception 'already_member' using errcode = 'P0001';
  end if;

  v_token := replace(replace(translate(encode(gen_random_bytes(32), 'base64'), E'\n', ''), '+', '-'), '/', '_');
  v_token := rtrim(v_token, '=');
  v_token_hash := encode(digest(v_token, 'sha256'), 'hex');
  v_expires_at := now() + interval '7 days';

  insert into public.v3_invites (
    hotel_id, tenant_id, email, role, token_hash, expires_at, created_by
  ) values (
    p_hotel_id, v_tenant_id, v_normalized_email, p_role, v_token_hash, v_expires_at, v_caller
  )
  returning id into v_invite_id;

  perform public.v3_emit_event(
    p_hotel_id, 'invite', v_invite_id, 'member.invited',
    jsonb_build_object(
      'invite_id', v_invite_id,
      'email', v_normalized_email,
      'role', p_role::text,
      'created_by', v_caller
    )
  );

  return jsonb_build_object(
    'invite_id', v_invite_id,
    'token', v_token,
    'email', v_normalized_email,
    'role', p_role::text,
    'expires_at', v_expires_at,
    'hotel_id', p_hotel_id
  );
end $$;

create or replace function public.v3_accept_invite(
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
  if v_caller is null then
    raise exception 'auth_required' using errcode = 'P0001';
  end if;

  select lower(email) into v_caller_email from auth.users where id = v_caller;
  if v_caller_email is null then
    raise exception 'user_email_missing' using errcode = 'P0001';
  end if;

  v_token_hash := encode(digest(p_token, 'sha256'), 'hex');

  select * into v_invite
  from public.v3_invites
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

  insert into public.v3_memberships (user_id, hotel_id, tenant_id, role, is_active, is_default)
  values (v_caller, v_invite.hotel_id, v_invite.tenant_id, v_invite.role, true, false)
  on conflict (user_id, hotel_id)
  do update set
    role = excluded.role,
    is_active = true;

  update public.v3_invites
  set accepted_at = now(), accepted_by = v_caller
  where id = v_invite.id;

  perform public.v3_emit_event(
    v_invite.hotel_id, 'invite', v_invite.id, 'member.accepted',
    jsonb_build_object('invite_id', v_invite.id, 'user_id', v_caller, 'role', v_invite.role::text)
  );

  return jsonb_build_object(
    'hotel_id', v_invite.hotel_id,
    'tenant_id', v_invite.tenant_id,
    'role', v_invite.role::text
  );
end $$;

create or replace function public.v3_revoke_invite(
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
  select * into v_invite from public.v3_invites where id = p_invite_id;
  if v_invite is null then
    raise exception 'invite_not_found' using errcode = 'P0002';
  end if;

  perform public.v3_check_membership(
    v_caller, v_invite.hotel_id,
    array['superadmin','direction','admin']::public.v3_app_role[]
  );

  if v_invite.accepted_at is not null then
    raise exception 'invite_already_accepted' using errcode = 'P0001';
  end if;
  if v_invite.revoked_at is not null then
    raise exception 'invite_already_revoked' using errcode = 'P0001';
  end if;

  update public.v3_invites
  set revoked_at = now()
  where id = p_invite_id;

  perform public.v3_emit_event(
    v_invite.hotel_id, 'invite', v_invite.id, 'member.invite_revoked',
    jsonb_build_object('invite_id', v_invite.id, 'revoked_by', v_caller)
  );
end $$;

create or replace function public.v3_preview_invite(
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
  if v_caller is null then
    raise exception 'auth_required' using errcode = 'P0001';
  end if;

  v_token_hash := encode(digest(p_token, 'sha256'), 'hex');

  select * into v_invite from public.v3_invites where token_hash = v_token_hash;
  if v_invite is null then
    raise exception 'invite_not_found' using errcode = 'P0002';
  end if;

  select name into v_hotel_name from public.v3_hotels where id = v_invite.hotel_id;
  select name into v_tenant_name from public.v3_tenants where id = v_invite.tenant_id;

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

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 7 — RPC import v3 (copiado de 00054)
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function public.v3_import_recipes_bulk(
  p_hotel_id uuid,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_import$
declare
  v_user_id uuid := auth.uid();
  v_role public.v3_app_role;
  v_run_id uuid;
  v_recipe jsonb;
  v_ingredient jsonb;
  v_recipe_id uuid;
  v_recipe_name text;
  v_recipe_name_normalized text;
  v_name_to_id jsonb := '{}'::jsonb;
  v_ok_count int := 0;
  v_failed_count int := 0;
  v_total_count int := 0;
  v_errors jsonb := '[]'::jsonb;
  v_row_index int := 0;
  v_error_message text;
begin
  v_role := public.v3_get_member_role(p_hotel_id);
  if v_role is null then
    raise exception 'not a member of hotel %', p_hotel_id using errcode = '42501';
  end if;
  if v_role not in ('superadmin', 'direction', 'admin') then
    raise exception 'role % cannot import recipes', v_role using errcode = '42501';
  end if;

  if p_payload is null
     or jsonb_typeof(p_payload->'recipes') <> 'array'
     or jsonb_typeof(p_payload->'ingredients') <> 'array'
  then
    raise exception 'payload must contain recipes[] and ingredients[]' using errcode = '22023';
  end if;

  v_total_count := jsonb_array_length(p_payload->'recipes')
                 + jsonb_array_length(p_payload->'ingredients');

  insert into public.v3_import_runs (hotel_id, kind, status, total_rows, created_by)
    values (p_hotel_id, 'recipes', 'running', v_total_count, v_user_id)
    returning id into v_run_id;

  for v_row_index, v_recipe in
    select ord, val from jsonb_array_elements(p_payload->'recipes') with ordinality as t(val, ord)
  loop
    v_recipe_name := trim(v_recipe->>'name');
    v_recipe_name_normalized := lower(v_recipe_name);

    begin
      insert into public.v3_recipes (
        hotel_id, name, description, category, subcategory, servings,
        yield_qty, yield_unit_id, prep_time_min, cook_time_min, rest_time_min,
        difficulty, status, target_price, allergens, dietary_tags, notes, image_url,
        created_by
      ) values (
        p_hotel_id,
        v_recipe_name,
        nullif(v_recipe->>'description', ''),
        (v_recipe->>'category')::public.v3_recipe_category,
        nullif(v_recipe->>'subcategory', ''),
        coalesce((v_recipe->>'servings')::int, 1),
        nullif((v_recipe->>'yield_qty'), '')::numeric,
        null,
        nullif((v_recipe->>'prep_time_min'), '')::int,
        nullif((v_recipe->>'cook_time_min'), '')::int,
        nullif((v_recipe->>'rest_time_min'), '')::int,
        coalesce((v_recipe->>'difficulty')::public.v3_recipe_difficulty, 'medium'::public.v3_recipe_difficulty),
        'draft'::public.v3_recipe_status,
        nullif((v_recipe->>'target_price'), '')::numeric,
        coalesce(
          (select array_agg(value::text) from jsonb_array_elements_text(v_recipe->'allergens')),
          '{}'::text[]
        ),
        coalesce(
          (select array_agg(value::text) from jsonb_array_elements_text(v_recipe->'dietary_tags')),
          '{}'::text[]
        ),
        nullif(v_recipe->>'notes', ''),
        nullif(v_recipe->>'image_url', ''),
        v_user_id
      )
      returning id into v_recipe_id;

      v_name_to_id := v_name_to_id || jsonb_build_object(v_recipe_name_normalized, v_recipe_id);
      v_ok_count := v_ok_count + 1;

    exception when others then
      v_failed_count := v_failed_count + 1;
      v_error_message := SQLERRM;
      v_errors := v_errors || jsonb_build_array(jsonb_build_object(
        'kind', 'recipe', 'row_index', v_row_index,
        'name', v_recipe_name, 'error', v_error_message
      ));
    end;
  end loop;

  for v_row_index, v_ingredient in
    select ord, val from jsonb_array_elements(p_payload->'ingredients') with ordinality as t(val, ord)
  loop
    declare
      v_target_recipe_id uuid;
      v_target_recipe_name text;
    begin
      v_target_recipe_name := trim(v_ingredient->>'recipe_name');
      v_target_recipe_id := (v_name_to_id ->> lower(v_target_recipe_name))::uuid;

      if v_target_recipe_id is null then
        v_failed_count := v_failed_count + 1;
        v_errors := v_errors || jsonb_build_array(jsonb_build_object(
          'kind', 'ingredient', 'row_index', v_row_index,
          'name', v_target_recipe_name,
          'error', 'recipe not found in this import (recipe_name FK)'
        ));
        continue;
      end if;

      insert into public.v3_recipe_ingredients (
        hotel_id, recipe_id, ingredient_name, product_id, unit_id,
        quantity_gross, waste_pct, unit_cost, sort_order, preparation_notes
      ) values (
        p_hotel_id, v_target_recipe_id, trim(v_ingredient->>'ingredient_name'),
        null, null,
        coalesce((v_ingredient->>'quantity_gross')::numeric, 0),
        coalesce((v_ingredient->>'waste_pct')::numeric, 0),
        coalesce((v_ingredient->>'unit_cost')::numeric, 0),
        coalesce((v_ingredient->>'sort_order')::int, 0),
        nullif(v_ingredient->>'preparation_notes', '')
      );

      v_ok_count := v_ok_count + 1;

    exception when others then
      v_failed_count := v_failed_count + 1;
      v_error_message := SQLERRM;
      v_errors := v_errors || jsonb_build_array(jsonb_build_object(
        'kind', 'ingredient', 'row_index', v_row_index,
        'name', coalesce(v_ingredient->>'ingredient_name', ''),
        'error', v_error_message
      ));
    end;
  end loop;

  update public.v3_import_runs set
    status = case
      when v_failed_count = 0 then 'completed'::public.v3_import_status
      when v_ok_count = 0 then 'failed'::public.v3_import_status
      else 'partial'::public.v3_import_status
    end,
    ok_rows = v_ok_count, failed_rows = v_failed_count,
    errors = v_errors, finished_at = now()
  where id = v_run_id;

  return jsonb_build_object(
    'run_id', v_run_id, 'ok_count', v_ok_count,
    'failed_count', v_failed_count, 'failed', v_errors
  );
end;
$fn_import$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 8 — RPCs catalog mapping v3 (copiado de 00056)
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function public.v3_match_product_by_alias(
  p_hotel_id uuid, p_query text, p_limit int default 10
)
returns jsonb
language plpgsql security definer
set search_path = public
as $fn_match_alias$
declare
  v_role public.v3_app_role;
  v_query_trimmed text;
  v_result jsonb;
begin
  v_role := public.v3_get_member_role(p_hotel_id);
  if v_role is null then
    raise exception 'not a member of hotel %', p_hotel_id using errcode = '42501';
  end if;

  v_query_trimmed := trim(p_query);
  if char_length(v_query_trimmed) = 0 then
    return '[]'::jsonb;
  end if;

  if p_limit is null or p_limit < 1 or p_limit > 50 then
    p_limit := 10;
  end if;

  with matches as (
    select pa.product_id, p.name as product_name, pa.alias_name as matched_text,
           (similarity(pa.alias_name, v_query_trimmed) * coalesce(pa.confidence_score, 1.0)) as sim,
           'alias'::text as match_kind, pa.source_type::text as source_type
    from public.v3_product_aliases pa
    join public.v3_products p on p.id = pa.product_id
    where pa.hotel_id = p_hotel_id and p.is_active = true
      and pa.alias_name % v_query_trimmed
    union all
    select p.id as product_id, p.name as product_name, p.name as matched_text,
           similarity(p.name, v_query_trimmed) as sim,
           'name'::text as match_kind, null::text as source_type
    from public.v3_products p
    where p.hotel_id = p_hotel_id and p.is_active = true
      and p.name % v_query_trimmed
  ),
  ranked as (
    select distinct on (product_id) product_id, product_name, matched_text, sim, match_kind, source_type
    from matches order by product_id, sim desc
  )
  select coalesce(jsonb_agg(row_to_json(r)::jsonb order by r.sim desc), '[]'::jsonb)
    into v_result
    from (
      select product_id, product_name, matched_text, sim as similarity, match_kind, source_type
        from ranked order by sim desc limit p_limit
    ) r;

  return v_result;
end;
$fn_match_alias$;

create or replace function public.v3_resolve_ingredient_mapping_bulk(
  p_hotel_id uuid, p_mapping jsonb
)
returns jsonb
language plpgsql security definer
set search_path = public
as $fn_resolve_mapping$
declare
  v_role public.v3_app_role;
  v_entry jsonb;
  v_recipe_id uuid;
  v_ingredient_name_raw text;
  v_ingredient_name_normalized text;
  v_product_id uuid;
  v_unit_id uuid;
  v_product_hotel uuid;
  v_unit_hotel uuid;
  v_affected int;
  v_count_matches int;
  v_ok_count int := 0;
  v_failed_count int := 0;
  v_failed jsonb := '[]'::jsonb;
  v_error_message text;
begin
  v_role := public.v3_get_member_role(p_hotel_id);
  if v_role is null then
    raise exception 'not a member of hotel %', p_hotel_id using errcode = '42501';
  end if;
  if v_role not in ('superadmin', 'direction', 'admin') then
    raise exception 'role % cannot map ingredients', v_role using errcode = '42501';
  end if;

  if p_mapping is null or jsonb_typeof(p_mapping->'mappings') <> 'array' then
    raise exception 'payload must contain mappings[] array' using errcode = '22023';
  end if;

  for v_entry in select * from jsonb_array_elements(p_mapping->'mappings')
  loop
    begin
      v_recipe_id := (v_entry->>'recipe_id')::uuid;
      v_ingredient_name_raw := v_entry->>'ingredient_name';
      v_product_id := nullif(v_entry->>'product_id', '')::uuid;
      v_unit_id := nullif(v_entry->>'unit_id', '')::uuid;

      if v_recipe_id is null or v_ingredient_name_raw is null then
        v_failed_count := v_failed_count + 1;
        v_failed := v_failed || jsonb_build_array(jsonb_build_object(
          'recipe_id', v_recipe_id, 'ingredient_name', v_ingredient_name_raw,
          'reason', 'missing_keys'
        ));
        continue;
      end if;

      v_ingredient_name_normalized := trim(lower(v_ingredient_name_raw));

      if v_product_id is not null then
        select hotel_id into v_product_hotel from public.v3_products where id = v_product_id;
        if v_product_hotel is null then
          v_failed_count := v_failed_count + 1;
          v_failed := v_failed || jsonb_build_array(jsonb_build_object(
            'recipe_id', v_recipe_id, 'ingredient_name', v_ingredient_name_raw,
            'reason', 'product_not_found'
          ));
          continue;
        end if;
        if v_product_hotel <> p_hotel_id then
          v_failed_count := v_failed_count + 1;
          v_failed := v_failed || jsonb_build_array(jsonb_build_object(
            'recipe_id', v_recipe_id, 'ingredient_name', v_ingredient_name_raw,
            'reason', 'product_wrong_hotel'
          ));
          continue;
        end if;
      end if;

      if v_unit_id is not null then
        select hotel_id into v_unit_hotel from public.v3_units_of_measure where id = v_unit_id;
        if v_unit_hotel is null then
          v_failed_count := v_failed_count + 1;
          v_failed := v_failed || jsonb_build_array(jsonb_build_object(
            'recipe_id', v_recipe_id, 'ingredient_name', v_ingredient_name_raw,
            'reason', 'unit_not_found'
          ));
          continue;
        end if;
        if v_unit_hotel <> p_hotel_id then
          v_failed_count := v_failed_count + 1;
          v_failed := v_failed || jsonb_build_array(jsonb_build_object(
            'recipe_id', v_recipe_id, 'ingredient_name', v_ingredient_name_raw,
            'reason', 'unit_wrong_hotel'
          ));
          continue;
        end if;
      end if;

      select count(*) into v_count_matches
        from public.v3_recipe_ingredients
        where hotel_id = p_hotel_id and recipe_id = v_recipe_id
          and trim(lower(ingredient_name)) = v_ingredient_name_normalized;

      if v_count_matches = 0 then
        v_failed_count := v_failed_count + 1;
        v_failed := v_failed || jsonb_build_array(jsonb_build_object(
          'recipe_id', v_recipe_id, 'ingredient_name', v_ingredient_name_raw,
          'reason', 'no_match'
        ));
        continue;
      elsif v_count_matches > 1 then
        v_failed_count := v_failed_count + 1;
        v_failed := v_failed || jsonb_build_array(jsonb_build_object(
          'recipe_id', v_recipe_id, 'ingredient_name', v_ingredient_name_raw,
          'reason', 'ambiguous'
        ));
        continue;
      end if;

      update public.v3_recipe_ingredients
        set product_id = v_product_id, unit_id = v_unit_id
        where hotel_id = p_hotel_id and recipe_id = v_recipe_id
          and trim(lower(ingredient_name)) = v_ingredient_name_normalized;

      get diagnostics v_affected = row_count;

      if v_affected = 1 then
        v_ok_count := v_ok_count + 1;
      else
        v_failed_count := v_failed_count + 1;
        v_failed := v_failed || jsonb_build_array(jsonb_build_object(
          'recipe_id', v_recipe_id, 'ingredient_name', v_ingredient_name_raw,
          'reason', 'update_failed'
        ));
      end if;

    exception when others then
      v_failed_count := v_failed_count + 1;
      v_error_message := SQLERRM;
      v_failed := v_failed || jsonb_build_array(jsonb_build_object(
        'recipe_id', v_recipe_id, 'ingredient_name', v_ingredient_name_raw,
        'reason', 'exception', 'error', v_error_message
      ));
    end;
  end loop;

  return jsonb_build_object(
    'ok_count', v_ok_count, 'failed_count', v_failed_count, 'failed', v_failed
  );
end;
$fn_resolve_mapping$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 9 — RPCs catalog suppliers v3 + trigger price_history
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function public.v3_tg_price_history_from_offer()
returns trigger
language plpgsql security definer
set search_path = public
as $fn_price_hist$
declare
  v_old_price numeric;
  v_variation numeric;
begin
  if tg_op = 'INSERT' then
    v_old_price := null;
  elsif tg_op = 'UPDATE' then
    if old.unit_price = new.unit_price then return new; end if;
    v_old_price := old.unit_price;
  else
    return new;
  end if;

  if v_old_price is not null and v_old_price > 0 then
    v_variation := ((new.unit_price - v_old_price) / v_old_price) * 100;
  else
    v_variation := null;
  end if;

  insert into public.v3_price_history (
    hotel_id, product_id, supplier_id, offer_id,
    recorded_at, old_price, new_price, variation_pct
  ) values (
    new.hotel_id, new.product_id, new.supplier_id, new.id,
    now(), v_old_price, new.unit_price, v_variation
  );

  return new;
end;
$fn_price_hist$;

drop trigger if exists v3_price_history_from_offer on public.v3_supplier_offers;
create trigger v3_price_history_from_offer
  after insert or update of unit_price on public.v3_supplier_offers
  for each row execute function public.v3_tg_price_history_from_offer();

drop policy if exists v3_price_history_insert on public.v3_price_history;
create policy v3_price_history_insert on public.v3_price_history
  for insert with check (public.v3_is_member_of(hotel_id));

create or replace function public.v3_mark_offer_preferred(
  p_hotel_id uuid, p_offer_id uuid
)
returns void
language plpgsql security definer
set search_path = public
as $fn_mark_preferred$
declare
  v_role public.v3_app_role;
  v_product_id uuid;
  v_offer_hotel uuid;
begin
  v_role := public.v3_get_member_role(p_hotel_id);
  if v_role is null then
    raise exception 'not a member of hotel %', p_hotel_id using errcode = '42501';
  end if;
  if v_role not in ('superadmin', 'direction', 'admin', 'procurement') then
    raise exception 'role % cannot mark offers preferred', v_role using errcode = '42501';
  end if;

  select hotel_id, product_id into v_offer_hotel, v_product_id
    from public.v3_supplier_offers where id = p_offer_id;
  if v_offer_hotel is null then
    raise exception 'offer % not found', p_offer_id using errcode = '42704';
  end if;
  if v_offer_hotel <> p_hotel_id then
    raise exception 'offer does not belong to hotel' using errcode = '42501';
  end if;

  update public.v3_supplier_offers
    set is_preferred = (id = p_offer_id), updated_at = now()
    where hotel_id = p_hotel_id and product_id = v_product_id;
end;
$fn_mark_preferred$;

create or replace function public.v3_get_catalog_prices(
  p_hotel_id uuid, p_product_ids uuid[]
)
returns jsonb
language plpgsql security definer
set search_path = public
as $fn_get_prices$
declare
  v_role public.v3_app_role;
  v_result jsonb;
begin
  v_role := public.v3_get_member_role(p_hotel_id);
  if v_role is null then
    raise exception 'not a member of hotel %', p_hotel_id using errcode = '42501';
  end if;

  if p_product_ids is null or array_length(p_product_ids, 1) is null then
    return '[]'::jsonb;
  end if;

  with valid_offers as (
    select o.product_id, o.id as offer_id, o.supplier_id, o.unit_id,
           o.unit_price, o.is_preferred,
           row_number() over (
             partition by o.product_id
             order by o.is_preferred desc, o.unit_price asc, o.updated_at desc
           ) as rnk
    from public.v3_supplier_offers o
    where o.hotel_id = p_hotel_id
      and o.product_id = any(p_product_ids)
      and (o.valid_from is null or o.valid_from <= current_date)
      and (o.valid_to is null or o.valid_to >= current_date)
  ),
  picked as (select * from valid_offers where rnk = 1)
  select coalesce(jsonb_agg(jsonb_build_object(
    'product_id', pid, 'price', price, 'unit_id', unit_id,
    'supplier_id', supplier_id, 'offer_id', offer_id, 'source', source,
    'is_preferred', is_preferred, 'currency', 'EUR'
  )), '[]'::jsonb) into v_result
  from (
    select pid, p.unit_price as price, p.unit_id, p.supplier_id, p.offer_id,
           case when p.is_preferred then 'offer_preferred' else 'offer_cheapest' end as source,
           p.is_preferred
    from unnest(p_product_ids) as pid
    left join picked p on p.product_id = pid
  ) r;

  return v_result;
end;
$fn_get_prices$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 10 — RPCs commercial (7 copiados de v2)
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function public.v3_get_events_calendar(p_hotel_id uuid, p_from date, p_to date)
returns jsonb
language plpgsql security definer
as $$
declare
  v_role public.v3_app_role;
begin
  v_role := public.v3_check_membership(auth.uid(), p_hotel_id);

  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', e.id, 'name', e.name,
          'event_type', e.event_type, 'service_type', e.service_type,
          'event_date', e.event_date, 'start_time', e.start_time,
          'end_time', e.end_time, 'guest_count', e.guest_count,
          'venue', e.venue, 'status', e.status,
          'beo_number', e.beo_number, 'client_name', c.name
        )
        order by e.event_date, e.start_time
      )
      from public.v3_events e
      left join public.v3_clients c on c.id = e.client_id
      where e.hotel_id = p_hotel_id
        and e.event_date between p_from and p_to
        and e.status != 'archived'
    ),
    '[]'::jsonb
  );
end;
$$;

create or replace function public.v3_create_event(
  p_hotel_id uuid, p_name text,
  p_event_type public.v3_event_type, p_service_type public.v3_service_type,
  p_event_date date, p_guest_count integer,
  p_client_id uuid default null,
  p_start_time time without time zone default null,
  p_end_time time without time zone default null,
  p_venue text default null, p_notes text default null
)
returns uuid
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_role       public.v3_app_role;
  v_event_id   uuid;
  v_beo_number text;
begin
  v_role := public.v3_check_membership(
    auth.uid(), p_hotel_id,
    array['superadmin', 'direction', 'admin', 'commercial']::public.v3_app_role[]
  );

  if p_client_id is not null then
    if not exists (
      select 1 from public.v3_clients
      where id = p_client_id and hotel_id = p_hotel_id
    ) then
      raise exception 'client does not belong to this hotel' using errcode = 'P0020';
    end if;
  end if;

  v_beo_number := 'BEO-' || to_char(p_event_date, 'YYYYMMDD') || '-' ||
    lpad((
      select count(*) + 1 from public.v3_events
      where hotel_id = p_hotel_id and event_date = p_event_date
    )::text, 4, '0');

  insert into public.v3_events (
    hotel_id, client_id, name, event_type, service_type,
    event_date, start_time, end_time, guest_count,
    venue, notes, beo_number, created_by
  ) values (
    p_hotel_id, p_client_id, p_name, p_event_type, p_service_type,
    p_event_date, p_start_time, p_end_time, p_guest_count,
    p_venue, p_notes, v_beo_number, auth.uid()
  ) returning id into v_event_id;

  insert into public.v3_event_versions (event_id, hotel_id, version_number, data, changed_by, change_reason)
  select v_event_id, p_hotel_id, 1, to_jsonb(e), auth.uid(), 'Evento creado'
  from public.v3_events e where e.id = v_event_id;

  perform public.v3_emit_event(
    p_hotel_id, 'event', v_event_id, 'event.created',
    jsonb_build_object('name', p_name, 'date', p_event_date, 'pax', p_guest_count)
  );

  return v_event_id;
end;
$$;

create or replace function public.v3_update_event(p_hotel_id uuid, p_event_id uuid, p_data jsonb, p_change_reason text default null)
returns void
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_role           public.v3_app_role;
  v_current_status public.v3_event_status;
  v_version        integer;
  v_new_client_id  uuid;
begin
  v_role := public.v3_check_membership(
    auth.uid(), p_hotel_id,
    array['superadmin', 'direction', 'admin', 'commercial']::public.v3_app_role[]
  );

  select status into v_current_status
  from public.v3_events where id = p_event_id and hotel_id = p_hotel_id;

  if v_current_status is null then
    raise exception 'event not found' using errcode = 'P0010';
  end if;

  if v_current_status in ('completed', 'cancelled', 'archived') then
    raise exception 'cannot update event in status %', v_current_status using errcode = 'P0011';
  end if;

  if p_data ? 'client_id' and p_data ->> 'client_id' is not null then
    v_new_client_id := (p_data ->> 'client_id')::uuid;
    if not exists (
      select 1 from public.v3_clients
      where id = v_new_client_id and hotel_id = p_hotel_id
    ) then
      raise exception 'client does not belong to this hotel' using errcode = 'P0020';
    end if;
  end if;

  update public.v3_events set
    name         = coalesce(p_data ->> 'name', name),
    event_type   = coalesce((p_data ->> 'event_type')::public.v3_event_type, event_type),
    service_type = coalesce((p_data ->> 'service_type')::public.v3_service_type, service_type),
    event_date   = coalesce((p_data ->> 'event_date')::date, event_date),
    start_time   = coalesce((p_data ->> 'start_time')::time, start_time),
    end_time     = coalesce((p_data ->> 'end_time')::time, end_time),
    guest_count  = coalesce((p_data ->> 'guest_count')::integer, guest_count),
    venue        = coalesce(p_data ->> 'venue', venue),
    notes        = coalesce(p_data ->> 'notes', notes),
    client_id    = case when p_data ? 'client_id' then (p_data ->> 'client_id')::uuid else client_id end,
    updated_at   = now()
  where id = p_event_id and hotel_id = p_hotel_id;

  select coalesce(max(version_number), 0) + 1 into v_version
  from public.v3_event_versions where event_id = p_event_id;

  insert into public.v3_event_versions (event_id, hotel_id, version_number, data, changed_by, change_reason)
  select p_event_id, p_hotel_id, v_version, to_jsonb(e), auth.uid(), p_change_reason
  from public.v3_events e where e.id = p_event_id;
end;
$$;

create or replace function public.v3_transition_event(p_hotel_id uuid, p_event_id uuid, p_new_status public.v3_event_status, p_reason text default null)
returns void
language plpgsql security definer
as $$
declare
  v_role public.v3_app_role;
  v_current_status public.v3_event_status;
  v_required_roles public.v3_app_role[];
begin
  v_required_roles := case p_new_status
    when 'pending_confirmation' then array['commercial', 'direction', 'admin', 'superadmin']::public.v3_app_role[]
    when 'confirmed' then array['commercial', 'direction', 'admin', 'superadmin']::public.v3_app_role[]
    when 'cancelled' then array['direction', 'admin', 'superadmin']::public.v3_app_role[]
    when 'in_preparation' then array['head_chef', 'direction', 'admin', 'superadmin']::public.v3_app_role[]
    when 'in_operation' then array['head_chef', 'direction', 'admin', 'superadmin']::public.v3_app_role[]
    when 'completed' then array['head_chef', 'direction', 'admin', 'superadmin']::public.v3_app_role[]
    when 'archived' then array['direction', 'admin', 'superadmin']::public.v3_app_role[]
    else array['superadmin']::public.v3_app_role[]
  end;

  v_role := public.v3_check_membership(auth.uid(), p_hotel_id, v_required_roles);

  select status into v_current_status
  from public.v3_events where id = p_event_id and hotel_id = p_hotel_id;

  if v_current_status is null then
    raise exception 'event not found' using errcode = 'P0010';
  end if;

  if not public.v3_validate_event_transition(v_current_status, p_new_status) then
    raise exception 'invalid transition: % → %', v_current_status, p_new_status using errcode = 'P0012';
  end if;

  if p_new_status = 'confirmed' then
    if not exists (select 1 from public.v3_event_menus where event_id = p_event_id) then
      raise exception 'cannot confirm event without menus' using errcode = 'P0013';
    end if;
  end if;

  if p_new_status = 'cancelled' and (p_reason is null or p_reason = '') then
    raise exception 'cancel reason is required' using errcode = 'P0014';
  end if;

  update public.v3_events set
    status = p_new_status,
    cancel_reason = case when p_new_status = 'cancelled' then p_reason else cancel_reason end,
    updated_at = now()
  where id = p_event_id and hotel_id = p_hotel_id;

  perform public.v3_emit_event(
    p_hotel_id, 'event', p_event_id,
    'event.' || p_new_status::text,
    jsonb_build_object('from', v_current_status, 'to', p_new_status, 'reason', p_reason)
  );
end;
$$;

create or replace function public.v3_get_event_beo(p_hotel_id uuid, p_event_id uuid)
returns jsonb
language plpgsql security definer
as $$
declare
  v_role public.v3_app_role;
begin
  v_role := public.v3_check_membership(auth.uid(), p_hotel_id, null);

  return (
    select jsonb_build_object(
      'id', e.id, 'beo_number', e.beo_number, 'name', e.name,
      'event_type', e.event_type, 'service_type', e.service_type,
      'event_date', e.event_date, 'start_time', e.start_time, 'end_time', e.end_time,
      'guest_count', e.guest_count, 'venue', e.venue,
      'setup_time', e.setup_time, 'teardown_time', e.teardown_time,
      'status', e.status, 'notes', e.notes,
      'theoretical_cost', e.theoretical_cost, 'actual_cost', e.actual_cost,
      'client', case when c.id is not null then
        jsonb_build_object('id', c.id, 'name', c.name, 'email', c.email, 'phone', c.phone, 'company', c.company)
        else null end,
      'hotel', jsonb_build_object('id', h.id, 'name', h.name),
      'menus', (
        select coalesce(jsonb_agg(
          jsonb_build_object(
            'id', em.id, 'menu_name', em.menu_name,
            'sort_order', em.sort_order, 'servings_override', em.servings_override,
            'sections', (
              select coalesce(jsonb_agg(
                jsonb_build_object(
                  'id', ms.id, 'name', ms.name, 'course_type', ms.course_type,
                  'recipes', (
                    select coalesce(jsonb_agg(
                      jsonb_build_object(
                        'id', r.id, 'name', r.name,
                        'servings_override', msr.servings_override,
                        'unit_cost', r.unit_cost, 'yield_pct', r.yield_pct
                      ) order by msr.sort_order
                    ), '[]')
                    from public.v3_menu_section_recipes msr
                    join public.v3_recipes r on r.id = msr.recipe_id
                    where msr.section_id = ms.id
                  )
                ) order by ms.sort_order
              ), '[]')
              from public.v3_menu_sections ms
              where ms.menu_id = em.menu_id
            )
          ) order by em.sort_order
        ), '[]')
        from public.v3_event_menus em
        where em.event_id = e.id
      ),
      'operational_impact', (
        select coalesce(jsonb_agg(
          jsonb_build_object('department', department, 'items', items)
          order by department
        ), '[]')
        from (
          select department,
            jsonb_agg(
              jsonb_build_object(
                'product_id', product_id, 'product_name', product_name,
                'quantity_needed', quantity_needed, 'unit', unit
              ) order by product_name
            ) as items
          from public.v3_event_operational_impact
          where event_id = e.id
          group by department
        ) impact_by_dept
      ),
      'spaces', (
        select coalesce(jsonb_agg(
          jsonb_build_object(
            'space_name', es.space_name, 'capacity', es.capacity,
            'setup_style', es.setup_style
          )
        ), '[]')
        from public.v3_event_spaces es
        where es.event_id = e.id
      )
    )
    from public.v3_events e
    left join public.v3_clients c on c.id = e.client_id
    join public.v3_hotels h on h.id = e.hotel_id
    where e.id = p_event_id and e.hotel_id = p_hotel_id
  );
end;
$$;

create or replace function public.v3_calculate_event_cost_estimate(p_hotel_id uuid, p_event_id uuid)
returns numeric
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_role public.v3_app_role;
  v_event record;
  v_cost numeric;
begin
  v_role := public.v3_check_membership(
    auth.uid(), p_hotel_id,
    array['superadmin', 'direction', 'admin', 'commercial']::public.v3_app_role[]
  );

  select * into v_event
  from public.v3_events where id = p_event_id and hotel_id = p_hotel_id;

  if not found then
    raise exception 'evento no encontrado' using errcode = 'P0010';
  end if;

  select coalesce(round(sum(
    ri.unit_cost * ri.quantity_gross
    * coalesce(em.servings_override, v_event.guest_count, 1)::numeric
    * coalesce(msr.servings_override, 1)::numeric
    / nullif(r.servings, 0)::numeric
  )::numeric, 2), 0)
  into v_cost
  from public.v3_event_menus em
  join public.v3_menus m on m.id = em.menu_id
  join public.v3_menu_sections ms on ms.menu_id = m.id
  join public.v3_menu_section_recipes msr on msr.section_id = ms.id
  join public.v3_recipes r on r.id = msr.recipe_id
  join public.v3_recipe_ingredients ri on ri.recipe_id = r.id
  where em.event_id = p_event_id
    and r.status = 'approved'
    and ri.unit_cost > 0;

  update public.v3_events
  set theoretical_cost = v_cost, updated_at = now()
  where id = p_event_id and hotel_id = p_hotel_id;

  return v_cost;
end;
$$;

create or replace function public.v3_generate_event_operational_impact(p_hotel_id uuid, p_event_id uuid)
returns integer
language plpgsql security definer
as $$
declare
  v_role public.v3_app_role;
  v_event record;
  v_count integer;
begin
  v_role := public.v3_check_membership(auth.uid(), p_hotel_id,
    array['superadmin','direction','admin','head_chef','sous_chef']::public.v3_app_role[]);

  select * into v_event
  from public.v3_events where id = p_event_id and hotel_id = p_hotel_id;

  if not found then
    raise exception 'evento no encontrado' using errcode = 'P0010';
  end if;

  delete from public.v3_event_operational_impact where event_id = p_event_id;

  insert into public.v3_event_operational_impact (
    hotel_id, event_id, product_id, product_name,
    quantity_needed, unit, department
  )
  select
    p_hotel_id, p_event_id, ri.product_id,
    coalesce(p.name, ri.ingredient_name) as product_name,
    round(sum(
      ri.quantity_gross
      * coalesce(em.servings_override, v_event.guest_count, 1)::numeric
      * coalesce(msr.servings_override, 1)::numeric
      / nullif(r.servings, 0)::numeric
    )::numeric, 3) as quantity_needed,
    u.abbreviation as unit,
    public.v3_category_to_department(r.category) as department
  from public.v3_event_menus em
  join public.v3_menus m on m.id = em.menu_id
  join public.v3_menu_sections ms on ms.menu_id = m.id
  join public.v3_menu_section_recipes msr on msr.section_id = ms.id
  join public.v3_recipes r on r.id = msr.recipe_id
  join public.v3_recipe_ingredients ri on ri.recipe_id = r.id
  left join public.v3_products p on p.id = ri.product_id
  left join public.v3_units_of_measure u on u.id = ri.unit_id
  where em.event_id = p_event_id
    and r.status = 'approved'
    and ri.quantity_gross > 0
  group by ri.product_id, coalesce(p.name, ri.ingredient_name), u.abbreviation, public.v3_category_to_department(r.category);

  get diagnostics v_count = row_count;

  perform public.v3_emit_event(
    p_hotel_id, 'event', p_event_id, 'comercial.impacto_operacional_generado',
    jsonb_build_object('rows', v_count)
  );

  return v_count;
end;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 11 — RPCs recipes (9 copiados de v2)
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function public.v3_submit_recipe_for_review(p_hotel_id uuid, p_recipe_id uuid)
returns void
language plpgsql security definer
as $$
declare
  v_role public.v3_app_role;
  v_status public.v3_recipe_status;
  v_ingredient_count integer;
begin
  v_role := public.v3_check_membership(auth.uid(), p_hotel_id,
    array['superadmin','direction','admin','head_chef','sous_chef','cook']::public.v3_app_role[]);

  select status into v_status
  from public.v3_recipes where id = p_recipe_id and hotel_id = p_hotel_id;

  if v_status is null then
    raise exception 'recipe not found' using errcode = 'P0404';
  end if;
  if v_status != 'draft' then
    raise exception 'recipe must be in draft status to submit for review (current: %)', v_status
      using errcode = 'P0003';
  end if;

  select count(*) into v_ingredient_count
  from public.v3_recipe_ingredients
  where recipe_id = p_recipe_id and hotel_id = p_hotel_id;

  if v_ingredient_count = 0 then
    raise exception 'recipe must have at least 1 ingredient before submitting' using errcode = 'P0003';
  end if;

  update public.v3_recipes
  set status = 'review_pending'
  where id = p_recipe_id and hotel_id = p_hotel_id;

  perform public.v3_emit_event(
    p_hotel_id, 'recipe', p_recipe_id, 'recipe.submitted_for_review',
    jsonb_build_object('submitted_by', auth.uid())
  );
end;
$$;

create or replace function public.v3_approve_recipe(p_hotel_id uuid, p_recipe_id uuid)
returns void
language plpgsql security definer
as $$
declare
  v_role public.v3_app_role;
  v_status public.v3_recipe_status;
  v_version integer;
begin
  v_role := public.v3_check_membership(auth.uid(), p_hotel_id,
    array['superadmin','direction','admin','head_chef']::public.v3_app_role[]);

  select status into v_status
  from public.v3_recipes where id = p_recipe_id and hotel_id = p_hotel_id;

  if v_status is null then
    raise exception 'recipe not found' using errcode = 'P0404';
  end if;
  if v_status != 'review_pending' then
    raise exception 'recipe must be in review_pending status to approve (current: %)', v_status
      using errcode = 'P0003';
  end if;

  select coalesce(max(version_number), 0) + 1 into v_version
  from public.v3_recipe_versions where recipe_id = p_recipe_id;

  insert into public.v3_recipe_versions (recipe_id, hotel_id, version_number, data, changed_by, change_reason)
  select p_recipe_id, p_hotel_id, v_version,
    jsonb_build_object(
      'name', r.name, 'description', r.description,
      'category', r.category, 'servings', r.servings,
      'total_cost', r.total_cost, 'allergens', r.allergens,
      'dietary_tags', r.dietary_tags,
      'ingredients', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'ingredient_name', ri.ingredient_name,
          'quantity_gross', ri.quantity_gross,
          'waste_pct', ri.waste_pct, 'unit_cost', ri.unit_cost
        )), '[]')
        from public.v3_recipe_ingredients ri
        where ri.recipe_id = p_recipe_id
      ),
      'steps', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'step_number', rs.step_number,
          'instruction', rs.instruction,
          'duration_min', rs.duration_min
        ) order by rs.step_number), '[]')
        from public.v3_recipe_steps rs
        where rs.recipe_id = p_recipe_id
      )
    ), auth.uid(), 'Approved'
  from public.v3_recipes r where r.id = p_recipe_id;

  update public.v3_recipes
  set status = 'approved', approved_by = auth.uid(), approved_at = now()
  where id = p_recipe_id and hotel_id = p_hotel_id;

  perform public.v3_emit_event(
    p_hotel_id, 'recipe', p_recipe_id, 'recipe.approved',
    jsonb_build_object('approved_by', auth.uid(), 'version', v_version)
  );
end;
$$;

create or replace function public.v3_deprecate_recipe(p_hotel_id uuid, p_recipe_id uuid)
returns void
language plpgsql security definer
as $$
declare
  v_role public.v3_app_role;
  v_status public.v3_recipe_status;
begin
  v_role := public.v3_check_membership(auth.uid(), p_hotel_id,
    array['superadmin','direction','admin','head_chef']::public.v3_app_role[]);

  select status into v_status
  from public.v3_recipes where id = p_recipe_id and hotel_id = p_hotel_id;

  if v_status is null then
    raise exception 'recipe not found' using errcode = 'P0404';
  end if;
  if v_status != 'approved' then
    raise exception 'only approved recipes can be deprecated (current: %)', v_status using errcode = 'P0003';
  end if;

  update public.v3_recipes
  set status = 'deprecated'
  where id = p_recipe_id and hotel_id = p_hotel_id;

  perform public.v3_emit_event(
    p_hotel_id, 'recipe', p_recipe_id, 'recipe.deprecated',
    jsonb_build_object('deprecated_by', auth.uid())
  );
end;
$$;

create or replace function public.v3_calculate_recipe_cost(p_hotel_id uuid, p_recipe_id uuid)
returns jsonb
language plpgsql security definer
as $$
declare
  v_role public.v3_app_role;
  v_ingredient_cost numeric(12,4) := 0;
  v_sub_recipe_cost numeric(12,4) := 0;
  v_total_cost numeric(12,4);
  v_cost_per_serving numeric(12,4);
  v_food_cost_pct numeric(5,2);
  v_servings integer;
  v_target_price numeric(12,2);
  v_sub record;
  v_sub_cost_result jsonb;
begin
  v_role := public.v3_check_membership(auth.uid(), p_hotel_id, null);

  select servings, target_price into v_servings, v_target_price
  from public.v3_recipes where id = p_recipe_id and hotel_id = p_hotel_id;

  if v_servings is null then
    raise exception 'recipe not found' using errcode = 'P0404';
  end if;

  select coalesce(sum(quantity_net * unit_cost), 0)
  into v_ingredient_cost
  from public.v3_recipe_ingredients
  where recipe_id = p_recipe_id and hotel_id = p_hotel_id;

  for v_sub in
    select sub_recipe_id, quantity
    from public.v3_recipe_sub_recipes
    where recipe_id = p_recipe_id
  loop
    v_sub_cost_result := public.v3__calculate_recipe_cost_recursive(
      p_hotel_id, v_sub.sub_recipe_id, array[p_recipe_id], 1
    );
    v_sub_recipe_cost := v_sub_recipe_cost +
      (v_sub_cost_result->>'cost_per_serving')::numeric * v_sub.quantity;
  end loop;

  v_total_cost := v_ingredient_cost + v_sub_recipe_cost;
  v_cost_per_serving := case when v_servings > 0 then v_total_cost / v_servings else 0 end;
  v_food_cost_pct := case
    when v_target_price is not null and v_target_price > 0
    then (v_cost_per_serving / v_target_price) * 100
    else 0
  end;

  update public.v3_recipes
  set total_cost = v_total_cost,
      cost_per_serving = v_cost_per_serving,
      food_cost_pct = v_food_cost_pct
  where id = p_recipe_id and hotel_id = p_hotel_id;

  return jsonb_build_object(
    'recipe_id', p_recipe_id,
    'ingredient_cost', v_ingredient_cost,
    'sub_recipe_cost', v_sub_recipe_cost,
    'total_cost', v_total_cost,
    'cost_per_serving', v_cost_per_serving,
    'food_cost_pct', v_food_cost_pct,
    'servings', v_servings
  );
end;
$$;

create or replace function public.v3_duplicate_recipe(p_hotel_id uuid, p_recipe_id uuid)
returns uuid
language plpgsql security definer
as $$
declare
  v_role public.v3_app_role;
  v_new_id uuid;
begin
  v_role := public.v3_check_membership(auth.uid(), p_hotel_id,
    array['superadmin','direction','admin','head_chef','sous_chef']::public.v3_app_role[]);

  insert into public.v3_recipes (
    hotel_id, name, description, category, subcategory,
    servings, yield_qty, yield_unit_id,
    prep_time_min, cook_time_min, rest_time_min,
    difficulty, status, allergens, dietary_tags, notes, created_by
  )
  select hotel_id, name || ' (copia)', description, category, subcategory,
    servings, yield_qty, yield_unit_id,
    prep_time_min, cook_time_min, rest_time_min,
    difficulty, 'draft'::public.v3_recipe_status, allergens, dietary_tags, notes, auth.uid()
  from public.v3_recipes
  where id = p_recipe_id and hotel_id = p_hotel_id
  returning id into v_new_id;

  if v_new_id is null then
    raise exception 'recipe not found' using errcode = 'P0404';
  end if;

  insert into public.v3_recipe_ingredients (
    recipe_id, hotel_id, ingredient_name, product_id,
    unit_id, quantity_gross, waste_pct, unit_cost,
    sort_order, preparation_notes
  )
  select v_new_id, hotel_id, ingredient_name, product_id,
    unit_id, quantity_gross, waste_pct, unit_cost,
    sort_order, preparation_notes
  from public.v3_recipe_ingredients
  where recipe_id = p_recipe_id;

  insert into public.v3_recipe_steps (
    recipe_id, hotel_id, step_number, instruction,
    duration_min, temperature, equipment, notes
  )
  select v_new_id, hotel_id, step_number, instruction,
    duration_min, temperature, equipment, notes
  from public.v3_recipe_steps
  where recipe_id = p_recipe_id;

  insert into public.v3_recipe_sub_recipes (recipe_id, sub_recipe_id, quantity, unit_id)
  select v_new_id, sub_recipe_id, quantity, unit_id
  from public.v3_recipe_sub_recipes
  where recipe_id = p_recipe_id;

  perform public.v3_emit_event(
    p_hotel_id, 'recipe', v_new_id, 'recipe.duplicated',
    jsonb_build_object('source_recipe_id', p_recipe_id, 'duplicated_by', auth.uid())
  );

  return v_new_id;
end;
$$;

create or replace function public.v3_scale_recipe(p_hotel_id uuid, p_recipe_id uuid, p_new_servings integer)
returns jsonb
language plpgsql security definer
as $$
declare
  v_role public.v3_app_role;
  v_current_servings integer;
  v_scale_factor numeric(10,4);
begin
  v_role := public.v3_check_membership(auth.uid(), p_hotel_id, null);

  select servings into v_current_servings
  from public.v3_recipes where id = p_recipe_id and hotel_id = p_hotel_id;

  if v_current_servings is null then
    raise exception 'recipe not found' using errcode = 'P0404';
  end if;
  if p_new_servings <= 0 then
    raise exception 'new servings must be greater than 0' using errcode = 'P0003';
  end if;

  v_scale_factor := p_new_servings::numeric / v_current_servings;

  return jsonb_build_object(
    'recipe_id', p_recipe_id,
    'original_servings', v_current_servings,
    'new_servings', p_new_servings,
    'scale_factor', v_scale_factor,
    'ingredients', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', ri.id, 'ingredient_name', ri.ingredient_name,
        'original_qty', ri.quantity_gross,
        'scaled_qty', round(ri.quantity_gross * v_scale_factor, 3),
        'waste_pct', ri.waste_pct,
        'scaled_net', round(ri.quantity_net * v_scale_factor, 3),
        'unit_abbreviation', u.abbreviation,
        'preparation_notes', ri.preparation_notes
      ) order by ri.sort_order), '[]')
      from public.v3_recipe_ingredients ri
      left join public.v3_units_of_measure u on u.id = ri.unit_id
      where ri.recipe_id = p_recipe_id
    ),
    'sub_recipes', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'sub_recipe_id', sr.sub_recipe_id,
        'sub_recipe_name', r.name,
        'original_qty', sr.quantity,
        'scaled_qty', round(sr.quantity * v_scale_factor, 3)
      )), '[]')
      from public.v3_recipe_sub_recipes sr
      join public.v3_recipes r on r.id = sr.sub_recipe_id
      where sr.recipe_id = p_recipe_id
    )
  );
end;
$$;

create or replace function public.v3_get_recipe_tech_sheet(p_hotel_id uuid, p_recipe_id uuid)
returns jsonb
language plpgsql security definer
as $$
declare
  v_role public.v3_app_role;
  v_recipe jsonb;
begin
  v_role := public.v3_check_membership(auth.uid(), p_hotel_id, null);

  select jsonb_build_object(
    'id', r.id, 'name', r.name, 'description', r.description,
    'category', r.category, 'subcategory', r.subcategory,
    'servings', r.servings, 'yield_qty', r.yield_qty,
    'prep_time_min', r.prep_time_min, 'cook_time_min', r.cook_time_min, 'rest_time_min', r.rest_time_min,
    'total_time_min', coalesce(r.prep_time_min, 0) + coalesce(r.cook_time_min, 0) + coalesce(r.rest_time_min, 0),
    'difficulty', r.difficulty, 'status', r.status,
    'total_cost', r.total_cost, 'cost_per_serving', r.cost_per_serving, 'food_cost_pct', r.food_cost_pct,
    'target_price', r.target_price,
    'allergens', r.allergens, 'dietary_tags', r.dietary_tags,
    'notes', r.notes, 'approved_at', r.approved_at,
    'ingredients', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'ingredient_name', ri.ingredient_name,
        'quantity_gross', ri.quantity_gross,
        'waste_pct', ri.waste_pct, 'quantity_net', ri.quantity_net,
        'unit_cost', ri.unit_cost,
        'line_cost', round(ri.quantity_net * ri.unit_cost, 4),
        'unit', u.abbreviation,
        'preparation_notes', ri.preparation_notes
      ) order by ri.sort_order), '[]')
      from public.v3_recipe_ingredients ri
      left join public.v3_units_of_measure u on u.id = ri.unit_id
      where ri.recipe_id = r.id
    ),
    'steps', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'step_number', rs.step_number, 'instruction', rs.instruction,
        'duration_min', rs.duration_min, 'temperature', rs.temperature,
        'equipment', rs.equipment, 'notes', rs.notes
      ) order by rs.step_number), '[]')
      from public.v3_recipe_steps rs
      where rs.recipe_id = r.id
    ),
    'sub_recipes', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'sub_recipe_id', sr.sub_recipe_id, 'name', sub.name,
        'quantity', sr.quantity, 'unit', u.abbreviation,
        'cost_per_serving', sub.cost_per_serving
      )), '[]')
      from public.v3_recipe_sub_recipes sr
      join public.v3_recipes sub on sub.id = sr.sub_recipe_id
      left join public.v3_units_of_measure u on u.id = sr.unit_id
      where sr.recipe_id = r.id
    )
  ) into v_recipe
  from public.v3_recipes r
  where r.id = p_recipe_id and r.hotel_id = p_hotel_id;

  if v_recipe is null then
    raise exception 'recipe not found' using errcode = 'P0404';
  end if;

  return v_recipe;
end;
$$;

-- TODO sprint-05: estas 2 RPCs consultan public.v3_goods_receipts/purchase_orders (v2).
-- Cuando sprint-05 cree v3_goods_receipts, actualizar a public.v3_*.
create or replace function public.v3_get_escandallo_live(p_hotel_id uuid, p_recipe_id uuid)
returns jsonb
language plpgsql security definer
as $$
declare
  v_role public.v3_app_role;
  v_result jsonb;
begin
  v_role := public.v3_check_membership(auth.uid(), p_hotel_id, null);

  select jsonb_build_object(
    'recipe_id', r.id, 'recipe_name', r.name,
    'category', r.category, 'servings', r.servings, 'status', r.status,
    'target_price', r.target_price,
    'stored_total_cost', r.total_cost,
    'stored_cost_per_serving', r.cost_per_serving,
    'stored_food_cost_pct', r.food_cost_pct,
    'has_price_changes', coalesce((
      select bool_or(
        lp.unit_cost is not null and abs(lp.unit_cost - ri_c.unit_cost) > 0.001
      )
      from public.v3_recipe_ingredients ri_c
      left join lateral (
        select grl.unit_cost
        from public.v3_goods_receipt_lines grl
        join public.v3_goods_receipts   gr  on gr.id  = grl.receipt_id
        join public.v3_purchase_order_lines pol on pol.id = grl.order_line_id
        where pol.product_id = ri_c.product_id
          and gr.hotel_id    = p_hotel_id
          and grl.quality_status = 'accepted'
          and grl.unit_cost  is not null
        order by gr.received_at desc limit 1
      ) lp on ri_c.product_id is not null
      where ri_c.recipe_id = p_recipe_id and ri_c.hotel_id = p_hotel_id
    ), false),
    'ingredients', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', ri.id, 'ingredient_name', ri.ingredient_name,
        'product_id', ri.product_id,
        'quantity_gross', ri.quantity_gross, 'waste_pct', ri.waste_pct,
        'quantity_net', ri.quantity_net,
        'unit_abbreviation', u.abbreviation,
        'unit_cost', ri.unit_cost,
        'line_cost', ri.quantity_net * ri.unit_cost,
        'latest_gr_cost', lp.unit_cost, 'latest_gr_date', lp.received_at,
        'latest_gr_receipt', lp.receipt_number,
        'latest_gr_delivery_note', lp.delivery_note_number,
        'latest_gr_supplier', lp.supplier_name,
        'price_changed', (lp.unit_cost is not null and abs(lp.unit_cost - ri.unit_cost) > 0.001),
        'price_delta', lp.unit_cost - ri.unit_cost,
        'price_delta_pct', case
          when ri.unit_cost > 0 and lp.unit_cost is not null
          then round(((lp.unit_cost - ri.unit_cost) / ri.unit_cost) * 100, 2)
          else null end,
        'line_cost_new', case
          when lp.unit_cost is not null
          then ri.quantity_net * lp.unit_cost
          else ri.quantity_net * ri.unit_cost end
      ) order by ri.sort_order)
      from public.v3_recipe_ingredients ri
      left join public.v3_units_of_measure u on u.id = ri.unit_id
      left join lateral (
        select grl.unit_cost, gr.received_at, gr.receipt_number,
               gr.delivery_note_number, s.name as supplier_name
        from public.v3_goods_receipt_lines  grl
        join public.v3_goods_receipts        gr  on gr.id  = grl.receipt_id
        join public.v3_purchase_order_lines  pol on pol.id = grl.order_line_id
        join public.v3_purchase_orders       po  on po.id  = pol.order_id
        join public.v3_suppliers             s   on s.id   = po.supplier_id
        where pol.product_id = ri.product_id
          and gr.hotel_id    = p_hotel_id
          and grl.quality_status = 'accepted'
          and grl.unit_cost  is not null
        order by gr.received_at desc limit 1
      ) lp on ri.product_id is not null
      where ri.recipe_id = p_recipe_id and ri.hotel_id  = p_hotel_id
    ), '[]')
  ) into v_result
  from public.v3_recipes r
  where r.id = p_recipe_id and r.hotel_id = p_hotel_id;

  return v_result;
end;
$$;

create or replace function public.v3_sync_escandallo_prices(p_hotel_id uuid, p_recipe_id uuid)
returns jsonb
language plpgsql security definer
as $$
declare
  v_role         public.v3_app_role;
  v_changes      jsonb := '[]';
  v_rec          record;
  v_new_total    numeric;
  v_servings     integer;
  v_target_price numeric;
begin
  v_role := public.v3_check_membership(auth.uid(), p_hotel_id,
    array['superadmin','direction','admin','head_chef']::public.v3_app_role[]);

  for v_rec in
    select ri.id, ri.ingredient_name, ri.unit_cost as old_cost, lp.unit_cost as new_cost
    from public.v3_recipe_ingredients ri
    join lateral (
      select grl.unit_cost
      from public.v3_goods_receipt_lines  grl
      join public.v3_goods_receipts        gr  on gr.id  = grl.receipt_id
      join public.v3_purchase_order_lines  pol on pol.id = grl.order_line_id
      where pol.product_id = ri.product_id
        and gr.hotel_id    = p_hotel_id
        and grl.quality_status = 'accepted'
        and grl.unit_cost  is not null
      order by gr.received_at desc limit 1
    ) lp on true
    where ri.recipe_id  = p_recipe_id and ri.hotel_id   = p_hotel_id
      and ri.product_id is not null
      and abs(lp.unit_cost - ri.unit_cost) > 0.001
  loop
    update public.v3_recipe_ingredients
    set unit_cost = v_rec.new_cost
    where id = v_rec.id;

    v_changes := v_changes || jsonb_build_array(jsonb_build_object(
      'ingredient', v_rec.ingredient_name,
      'old_cost', v_rec.old_cost, 'new_cost', v_rec.new_cost,
      'delta_pct', case when v_rec.old_cost > 0
        then round(((v_rec.new_cost - v_rec.old_cost) / v_rec.old_cost) * 100, 2)
        else null end
    ));
  end loop;

  if jsonb_array_length(v_changes) > 0 then
    select coalesce(sum(ri.quantity_net * ri.unit_cost), 0),
           r.servings, r.target_price
    into v_new_total, v_servings, v_target_price
    from public.v3_recipe_ingredients ri
    join public.v3_recipes r on r.id = ri.recipe_id
    where ri.recipe_id = p_recipe_id and ri.hotel_id  = p_hotel_id
    group by r.servings, r.target_price;

    update public.v3_recipes
    set total_cost = v_new_total,
        cost_per_serving = case when v_servings > 0 then v_new_total / v_servings else 0 end,
        food_cost_pct = case
          when v_target_price > 0 and v_servings > 0
          then round((v_new_total / v_servings / v_target_price) * 100, 2)
          else 0 end,
        updated_at = now()
    where id = p_recipe_id and hotel_id = p_hotel_id;

    perform public.v3_emit_event(
      p_hotel_id, 'recipe', p_recipe_id, 'recipe.prices_synced',
      jsonb_build_object(
        'changes_count', jsonb_array_length(v_changes),
        'new_total_cost', v_new_total
      )
    );
  end if;

  return jsonb_build_object(
    'changes_count', jsonb_array_length(v_changes),
    'changes', v_changes
  );
end;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECCIÓN 12 — Policies SELECT (mutaciones via RPCs SECURITY DEFINER — no policy)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Tablas con columna hotel_id directa: patrón is_member_of(hotel_id).
do $policies$
declare
  t text;
  tables_with_hotel text[] := array[
    'v3_memberships','v3_invites','v3_clients','v3_events','v3_event_spaces',
    'v3_event_menus','v3_event_operational_impact','v3_event_versions',
    'v3_recipes','v3_recipe_ingredients','v3_recipe_steps','v3_recipe_versions',
    'v3_menus','v3_menu_sections','v3_menu_section_recipes',
    'v3_products','v3_product_aliases','v3_product_categories','v3_units_of_measure',
    'v3_suppliers','v3_supplier_configs','v3_supplier_offers','v3_supplier_incidents',
    'v3_product_supplier_refs','v3_price_history',
    'v3_purchase_requests','v3_purchase_orders','v3_purchase_order_lines',
    'v3_goods_receipts','v3_goods_receipt_lines',
    'v3_import_runs','v3_audit_logs','v3_domain_events'
  ];
begin
  foreach t in array tables_with_hotel loop
    execute format('drop policy if exists %I_select_members on public.%I', t, t);
    execute format(
      'create policy %I_select_members on public.%I for select using (public.v3_is_member_of(hotel_id))',
      t, t
    );
  end loop;
end;
$policies$;

-- v3_tenants: miembros de cualquier hotel del tenant.
drop policy if exists v3_tenants_select_members on public.v3_tenants;
create policy v3_tenants_select_members on public.v3_tenants
  for select using (
    exists (
      select 1 from public.v3_memberships m
      where m.tenant_id = v3_tenants.id
        and m.user_id = auth.uid()
        and m.is_active = true
    )
  );

-- v3_hotels: miembros del propio hotel.
drop policy if exists v3_hotels_select_members on public.v3_hotels;
create policy v3_hotels_select_members on public.v3_hotels
  for select using (public.v3_is_member_of(id));

-- v3_profiles: propio perfil + perfiles de miembros de los mismos hoteles.
drop policy if exists v3_profiles_select_self on public.v3_profiles;
create policy v3_profiles_select_self on public.v3_profiles
  for select using (
    id = auth.uid()
    or exists (
      select 1
      from public.v3_memberships mine
      join public.v3_memberships other on other.hotel_id = mine.hotel_id
      where mine.user_id = auth.uid()
        and mine.is_active = true
        and other.user_id = v3_profiles.id
        and other.is_active = true
    )
  );

-- v3_recipe_sub_recipes: sin hotel_id directo → resolver vía v3_recipes.
drop policy if exists v3_recipe_sub_recipes_select_members on public.v3_recipe_sub_recipes;
create policy v3_recipe_sub_recipes_select_members on public.v3_recipe_sub_recipes
  for select using (
    exists (
      select 1 from public.v3_recipes r
      where r.id = v3_recipe_sub_recipes.recipe_id
        and public.v3_is_member_of(r.hotel_id)
    )
  );
