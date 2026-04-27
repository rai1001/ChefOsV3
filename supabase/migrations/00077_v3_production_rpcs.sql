-- 00077_v3_production_rpcs.sql
-- Sprint-07 · production order RPCs with atomic FIFO consumption.
-- ADR-0015: all v3-owned DB objects are prefixed with v3_.

create index if not exists v3_inventory_movements_production_order_origin_idx
  on public.v3_inventory_movements(hotel_id, ((origin ->> 'production_order_id')))
  where (origin ->> 'source') = 'production';

create or replace function public.v3_scale_recipe(
  p_hotel_id uuid,
  p_recipe_id uuid,
  p_target_servings numeric
)
returns table (
  product_id uuid,
  quantity_required numeric,
  unit_id uuid,
  estimated_unit_cost numeric
)
language sql
stable
security definer
set search_path = public
as $fn_v3_scale_recipe_production$
  with _membership as materialized (
    select public.v3_check_membership(auth.uid(), p_hotel_id, null)
  ),
  recipe as (
    select r.id, r.servings::numeric as source_servings
    from _membership
    cross join public.v3_recipes r
    where r.id = p_recipe_id
      and r.hotel_id = p_hotel_id
      and r.status not in ('deprecated', 'archived')
      and r.servings > 0
      and p_target_servings > 0
  )
  select
    ri.product_id,
    round((coalesce(ri.quantity_net, ri.quantity_gross) * (p_target_servings / recipe.source_servings))::numeric, 4) as quantity_required,
    ri.unit_id,
    coalesce(latest_lot.unit_cost, latest_gr.unit_price, 0)::numeric(14,4) as estimated_unit_cost
  from recipe
  join public.v3_recipe_ingredients ri
    on ri.recipe_id = recipe.id
   and ri.hotel_id = p_hotel_id
  left join lateral (
    select lot.unit_cost
    from public.v3_inventory_lots lot
    where lot.hotel_id = p_hotel_id
      and lot.product_id = ri.product_id
    order by lot.received_at desc, lot.id desc
    limit 1
  ) latest_lot on ri.product_id is not null
  left join lateral (
    select grl.unit_price
    from public.v3_goods_receipt_lines grl
    join public.v3_goods_receipts gr
      on gr.id = grl.goods_receipt_id
     and gr.hotel_id = p_hotel_id
    where grl.hotel_id = p_hotel_id
      and grl.product_id = ri.product_id
      and grl.quality_status = 'accepted'
      and grl.quantity_received > 0
      and grl.unit_price is not null
    order by gr.received_at desc, grl.created_at desc
    limit 1
  ) latest_gr on ri.product_id is not null
  where ri.product_id is not null
    and ri.unit_id is not null
    and coalesce(ri.quantity_net, ri.quantity_gross) > 0
  order by ri.sort_order, ri.id;
$fn_v3_scale_recipe_production$;

create or replace function public.v3_create_production_order(
  p_hotel_id uuid,
  p_recipe_id uuid,
  p_servings numeric,
  p_scheduled_at timestamptz default null,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_create_production_order$
declare
  v_recipe record;
  v_order_id uuid;
  v_lines jsonb;
  v_total_estimated_cost numeric(18,4);
  v_lines_count integer;
  v_unmapped_count integer;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef','sous_chef']::public.v3_app_role[]
  );

  if p_servings is null or p_servings <= 0 then
    raise exception 'servings must be > 0' using errcode = 'P0003';
  end if;

  select r.id, r.servings, r.status
    into v_recipe
  from public.v3_recipes r
  where r.id = p_recipe_id
    and r.hotel_id = p_hotel_id
    and r.status not in ('deprecated', 'archived');

  if v_recipe.id is null then
    raise exception 'production recipe not found' using errcode = 'P0010';
  end if;

  if v_recipe.servings is null or v_recipe.servings <= 0 then
    raise exception 'recipe servings must be > 0' using errcode = 'P0003';
  end if;

  select count(*)
    into v_unmapped_count
  from public.v3_recipe_ingredients ri
  where ri.recipe_id = p_recipe_id
    and ri.hotel_id = p_hotel_id
    and (
      ri.product_id is null
      or ri.unit_id is null
      or coalesce(ri.quantity_net, ri.quantity_gross) <= 0
    );

  if v_unmapped_count > 0 then
    raise exception 'recipe has unmapped or invalid ingredients: %', v_unmapped_count
      using errcode = 'P0003';
  end if;

  insert into public.v3_production_orders (
    hotel_id,
    recipe_id,
    servings,
    status,
    scheduled_at,
    notes,
    created_by
  )
  values (
    p_hotel_id,
    p_recipe_id,
    p_servings::numeric(14,4),
    'draft',
    p_scheduled_at,
    nullif(btrim(coalesce(p_notes, '')), ''),
    auth.uid()
  )
  returning id into v_order_id;

  insert into public.v3_production_order_lines (
    hotel_id,
    production_order_id,
    product_id,
    quantity_required,
    unit_id,
    estimated_unit_cost
  )
  select
    p_hotel_id,
    v_order_id,
    scaled.product_id,
    scaled.quantity_required::numeric(14,4),
    scaled.unit_id,
    scaled.estimated_unit_cost::numeric(14,4)
  from public.v3_scale_recipe(p_hotel_id, p_recipe_id, p_servings) scaled;

  select count(*),
         coalesce(sum(l.estimated_total_cost), 0)::numeric(18,4),
         coalesce(jsonb_agg(to_jsonb(l) order by l.created_at, l.id), '[]'::jsonb)
    into v_lines_count, v_total_estimated_cost, v_lines
  from public.v3_production_order_lines l
  where l.hotel_id = p_hotel_id
    and l.production_order_id = v_order_id;

  if v_lines_count = 0 then
    raise exception 'recipe has no producible ingredients' using errcode = 'P0003';
  end if;

  update public.v3_production_orders
  set estimated_total_cost = v_total_estimated_cost
  where hotel_id = p_hotel_id
    and id = v_order_id;

  perform public.v3_emit_event(
    p_hotel_id,
    'production_order',
    v_order_id,
    'production.created',
    jsonb_build_object(
      'recipe_id', p_recipe_id,
      'servings', p_servings,
      'scheduled_at', p_scheduled_at,
      'created_by', auth.uid()
    )
  );

  return jsonb_build_object(
    'order_id', v_order_id,
    'lines', v_lines,
    'total_estimated_cost', v_total_estimated_cost
  );
end;
$fn_v3_create_production_order$;

create or replace function public.v3_check_production_feasibility(
  p_hotel_id uuid,
  p_production_order_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_check_production_feasibility$
declare
  v_order_id uuid;
  v_deficits jsonb;
begin
  perform public.v3_check_membership(auth.uid(), p_hotel_id, null);

  select po.id
    into v_order_id
  from public.v3_production_orders po
  where po.id = p_production_order_id
    and po.hotel_id = p_hotel_id;

  if v_order_id is null then
    raise exception 'production order not found' using errcode = 'P0010';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'product_id', deficit.product_id,
    'required', deficit.required,
    'available', deficit.available,
    'missing', deficit.missing
  ) order by deficit.product_id), '[]'::jsonb)
    into v_deficits
  from (
    select
      l.product_id,
      l.quantity_required::numeric(14,4) as required,
      coalesce(sum(lot.quantity_remaining), 0)::numeric(14,4) as available,
      (l.quantity_required - coalesce(sum(lot.quantity_remaining), 0))::numeric(14,4) as missing
    from public.v3_production_order_lines l
    left join public.v3_inventory_lots lot
      on lot.hotel_id = p_hotel_id
     and lot.product_id = l.product_id
     and lot.quantity_remaining > 0
    where l.hotel_id = p_hotel_id
      and l.production_order_id = p_production_order_id
    group by l.id, l.product_id, l.quantity_required
    having coalesce(sum(lot.quantity_remaining), 0) < l.quantity_required
  ) deficit;

  return jsonb_build_object(
    'feasible', jsonb_array_length(v_deficits) = 0,
    'deficits', v_deficits
  );
end;
$fn_v3_check_production_feasibility$;

create or replace function public.v3_start_production(
  p_hotel_id uuid,
  p_production_order_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_start_production$
declare
  v_order record;
  v_line record;
  v_result jsonb;
  v_feasibility jsonb;
  v_actual_total_cost numeric(18,4) := 0;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef','sous_chef','cook']::public.v3_app_role[]
  );

  select *
    into v_order
  from public.v3_production_orders po
  where po.id = p_production_order_id
    and po.hotel_id = p_hotel_id
  for update;

  if v_order.id is null then
    raise exception 'production order not found' using errcode = 'P0010';
  end if;

  if v_order.status not in ('draft', 'scheduled') then
    raise exception 'production order cannot start from status %', v_order.status
      using errcode = 'P0003';
  end if;

  set local lock_timeout = '5s';

  perform 1
  from public.v3_inventory_lots lot
  where lot.hotel_id = p_hotel_id
    and lot.product_id in (
      select l.product_id
      from public.v3_production_order_lines l
      where l.hotel_id = p_hotel_id
        and l.production_order_id = p_production_order_id
    )
    and lot.quantity_remaining > 0
  order by lot.product_id, lot.received_at asc, lot.id asc
  for update;

  v_feasibility := public.v3_check_production_feasibility(p_hotel_id, p_production_order_id);

  if coalesce((v_feasibility ->> 'feasible')::boolean, false) = false then
    raise exception 'insufficient stock for production order %', p_production_order_id
      using errcode = 'P0002',
            detail = (v_feasibility -> 'deficits')::text;
  end if;

  for v_line in
    select *
    from public.v3_production_order_lines l
    where l.hotel_id = p_hotel_id
      and l.production_order_id = p_production_order_id
    order by l.created_at, l.id
  loop
    v_result := public.v3_consume_inventory(
      p_hotel_id,
      v_line.product_id,
      v_line.quantity_required,
      jsonb_build_object(
        'source', 'production',
        'production_order_id', p_production_order_id,
        'production_order_line_id', v_line.id,
        'recipe_id', v_order.recipe_id
      )
    );

    update public.v3_production_order_lines
    set actual_consumed_quantity = (v_result ->> 'quantity')::numeric(14,4),
        actual_total_cost = (v_result ->> 'total_cost')::numeric(18,4),
        weighted_unit_cost = (v_result ->> 'weighted_unit_cost')::numeric(14,4)
    where hotel_id = p_hotel_id
      and id = v_line.id;

    v_actual_total_cost := v_actual_total_cost + (v_result ->> 'total_cost')::numeric(18,4);
  end loop;

  update public.v3_production_orders
  set status = 'in_progress',
      started_at = now(),
      actual_total_cost = v_actual_total_cost
  where hotel_id = p_hotel_id
    and id = p_production_order_id;

  perform public.v3_emit_event(
    p_hotel_id,
    'production_order',
    p_production_order_id,
    'production.started',
    jsonb_build_object(
      'recipe_id', v_order.recipe_id,
      'servings', v_order.servings,
      'actual_total_cost', v_actual_total_cost,
      'started_by', auth.uid()
    )
  );

  return public.v3_get_production_order(p_hotel_id, p_production_order_id);
end;
$fn_v3_start_production$;

create or replace function public.v3_complete_production(
  p_hotel_id uuid,
  p_production_order_id uuid,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_complete_production$
declare
  v_order record;
  v_notes text := nullif(btrim(coalesce(p_notes, '')), '');
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef','sous_chef','cook']::public.v3_app_role[]
  );

  select *
    into v_order
  from public.v3_production_orders po
  where po.id = p_production_order_id
    and po.hotel_id = p_hotel_id
  for update;

  if v_order.id is null then
    raise exception 'production order not found' using errcode = 'P0010';
  end if;

  if v_order.status <> 'in_progress' then
    raise exception 'production order cannot complete from status %', v_order.status
      using errcode = 'P0003';
  end if;

  update public.v3_production_orders
  set status = 'completed',
      completed_at = now(),
      notes = case
        when v_notes is null then notes
        else concat_ws(E'\n', notes, 'Completada: ' || v_notes)
      end
  where hotel_id = p_hotel_id
    and id = p_production_order_id;

  perform public.v3_emit_event(
    p_hotel_id,
    'production_order',
    p_production_order_id,
    'production.completed',
    jsonb_build_object('completed_by', auth.uid())
  );

  return public.v3_get_production_order(p_hotel_id, p_production_order_id);
end;
$fn_v3_complete_production$;

create or replace function public.v3_cancel_production(
  p_hotel_id uuid,
  p_production_order_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_cancel_production$
declare
  v_order record;
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef','sous_chef']::public.v3_app_role[]
  );

  if v_reason is null then
    raise exception 'cancellation reason is required' using errcode = 'P0003';
  end if;

  select *
    into v_order
  from public.v3_production_orders po
  where po.id = p_production_order_id
    and po.hotel_id = p_hotel_id
  for update;

  if v_order.id is null then
    raise exception 'production order not found' using errcode = 'P0010';
  end if;

  if v_order.status = 'completed' then
    raise exception 'completed production order cannot be cancelled' using errcode = 'P0003';
  end if;

  if v_order.status = 'cancelled' then
    raise exception 'production order is already cancelled' using errcode = 'P0016';
  end if;

  update public.v3_production_orders
  set status = 'cancelled',
      cancelled_at = now(),
      cancellation_reason = v_reason,
      notes = concat_ws(E'\n', notes, 'Cancelada: ' || v_reason)
  where hotel_id = p_hotel_id
    and id = p_production_order_id;

  if v_order.status = 'in_progress' then
    update public.v3_inventory_movements
    set notes = concat_ws(E'\n', notes, 'Producción cancelada: ' || v_reason)
    where hotel_id = p_hotel_id
      and origin ->> 'source' = 'production'
      and origin ->> 'production_order_id' = p_production_order_id::text;
  end if;

  perform public.v3_emit_event(
    p_hotel_id,
    'production_order',
    p_production_order_id,
    'production.cancelled',
    jsonb_build_object(
      'cancelled_by', auth.uid(),
      'previous_status', v_order.status,
      'reason', v_reason,
      'stock_restored', false
    )
  );

  return public.v3_get_production_order(p_hotel_id, p_production_order_id);
end;
$fn_v3_cancel_production$;

create or replace function public.v3_list_production_orders(
  p_hotel_id uuid,
  p_status public.v3_production_status default null,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_limit integer default 50,
  p_offset integer default 0
)
returns table (
  id uuid,
  hotel_id uuid,
  recipe_id uuid,
  recipe_name text,
  servings numeric,
  status public.v3_production_status,
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  estimated_total_cost numeric,
  actual_total_cost numeric,
  notes text,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $fn_v3_list_production_orders$
begin
  perform public.v3_check_membership(auth.uid(), p_hotel_id, null);

  return query
  select
    po.id,
    po.hotel_id,
    po.recipe_id,
    r.name as recipe_name,
    po.servings,
    po.status,
    po.scheduled_at,
    po.started_at,
    po.completed_at,
    po.cancelled_at,
    po.estimated_total_cost,
    po.actual_total_cost,
    po.notes,
    po.created_by,
    po.created_at,
    po.updated_at
  from public.v3_production_orders po
  join public.v3_recipes r
    on r.id = po.recipe_id
   and r.hotel_id = p_hotel_id
  where po.hotel_id = p_hotel_id
    and (p_status is null or po.status = p_status)
    and (p_from is null or coalesce(po.scheduled_at, po.created_at) >= p_from)
    and (p_to is null or coalesce(po.scheduled_at, po.created_at) <= p_to)
  order by coalesce(po.scheduled_at, po.created_at) desc, po.created_at desc, po.id desc
  limit least(greatest(coalesce(p_limit, 50), 1), 100)
  offset greatest(coalesce(p_offset, 0), 0);
end;
$fn_v3_list_production_orders$;

create or replace function public.v3_get_production_order(
  p_hotel_id uuid,
  p_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_get_production_order$
declare
  v_order jsonb;
  v_lines jsonb;
  v_movements jsonb;
begin
  perform public.v3_check_membership(auth.uid(), p_hotel_id, null);

  select to_jsonb(po) || jsonb_build_object('recipe_name', r.name)
    into v_order
  from public.v3_production_orders po
  join public.v3_recipes r
    on r.id = po.recipe_id
   and r.hotel_id = p_hotel_id
  where po.id = p_id
    and po.hotel_id = p_hotel_id;

  if v_order is null then
    raise exception 'production order not found' using errcode = 'P0010';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', l.id,
    'hotel_id', l.hotel_id,
    'production_order_id', l.production_order_id,
    'product_id', l.product_id,
    'product_name', p.name,
    'quantity_required', l.quantity_required,
    'unit_id', l.unit_id,
    'unit_name', u.name,
    'unit_abbreviation', u.abbreviation,
    'estimated_unit_cost', l.estimated_unit_cost,
    'estimated_total_cost', l.estimated_total_cost,
    'actual_consumed_quantity', l.actual_consumed_quantity,
    'actual_total_cost', l.actual_total_cost,
    'weighted_unit_cost', l.weighted_unit_cost,
    'created_at', l.created_at
  ) order by l.created_at, l.id), '[]'::jsonb)
    into v_lines
  from public.v3_production_order_lines l
  join public.v3_products p
    on p.id = l.product_id
   and p.hotel_id = p_hotel_id
  join public.v3_units_of_measure u
    on u.id = l.unit_id
   and u.hotel_id = p_hotel_id
  where l.hotel_id = p_hotel_id
    and l.production_order_id = p_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', m.id,
    'product_id', m.product_id,
    'product_name', p.name,
    'lot_id', m.lot_id,
    'kind', m.kind,
    'quantity', m.quantity,
    'unit_id', m.unit_id,
    'unit_name', u.name,
    'unit_abbreviation', u.abbreviation,
    'unit_cost', m.unit_cost,
    'total_cost', m.total_cost,
    'origin', m.origin,
    'notes', m.notes,
    'created_by', m.created_by,
    'created_at', m.created_at
  ) order by m.created_at, m.id), '[]'::jsonb)
    into v_movements
  from public.v3_inventory_movements m
  join public.v3_products p
    on p.id = m.product_id
   and p.hotel_id = p_hotel_id
  join public.v3_units_of_measure u
    on u.id = m.unit_id
   and u.hotel_id = p_hotel_id
  where m.hotel_id = p_hotel_id
    and m.origin ->> 'source' = 'production'
    and m.origin ->> 'production_order_id' = p_id::text;

  return jsonb_build_object(
    'order', v_order,
    'lines', v_lines,
    'movements', v_movements
  );
end;
$fn_v3_get_production_order$;

revoke all on function public.v3_scale_recipe(uuid, uuid, numeric) from public, anon, authenticated;
grant execute on function public.v3_scale_recipe(uuid, uuid, numeric) to authenticated;

revoke all on function public.v3_create_production_order(uuid, uuid, numeric, timestamptz, text) from public, anon, authenticated;
grant execute on function public.v3_create_production_order(uuid, uuid, numeric, timestamptz, text) to authenticated;

revoke all on function public.v3_check_production_feasibility(uuid, uuid) from public, anon, authenticated;
grant execute on function public.v3_check_production_feasibility(uuid, uuid) to authenticated;

revoke all on function public.v3_start_production(uuid, uuid) from public, anon, authenticated;
grant execute on function public.v3_start_production(uuid, uuid) to authenticated;

revoke all on function public.v3_complete_production(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.v3_complete_production(uuid, uuid, text) to authenticated;

revoke all on function public.v3_cancel_production(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.v3_cancel_production(uuid, uuid, text) to authenticated;

revoke all on function public.v3_list_production_orders(uuid, public.v3_production_status, timestamptz, timestamptz, integer, integer) from public, anon, authenticated;
grant execute on function public.v3_list_production_orders(uuid, public.v3_production_status, timestamptz, timestamptz, integer, integer) to authenticated;

revoke all on function public.v3_get_production_order(uuid, uuid) from public, anon, authenticated;
grant execute on function public.v3_get_production_order(uuid, uuid) to authenticated;
