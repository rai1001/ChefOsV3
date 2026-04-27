-- 00080_v3_subrecipe_rpcs.sql
-- Sprint-08 · on-demand sub-recipe cascade for production orders.
-- ADR-0015: all v3-owned DB objects are prefixed with v3_.

create index if not exists v3_inventory_movements_subrecipe_parent_origin_idx
  on public.v3_inventory_movements(hotel_id, ((origin ->> 'parent_production_order_id')))
  where (origin ->> 'source') = 'subrecipe_production';

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
as $fn_v3_create_production_order_subrecipes$
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
    source_recipe_id,
    quantity_required,
    unit_id,
    estimated_unit_cost
  )
  select
    p_hotel_id,
    v_order_id,
    ri.product_id,
    ri.source_recipe_id,
    round((coalesce(ri.quantity_net, ri.quantity_gross) * (p_servings / v_recipe.servings))::numeric, 4)::numeric(14,4) as quantity_required,
    ri.unit_id,
    coalesce(latest_lot.unit_cost, latest_gr.unit_price, 0)::numeric(14,4) as estimated_unit_cost
  from public.v3_recipe_ingredients ri
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
  where ri.recipe_id = p_recipe_id
    and ri.hotel_id = p_hotel_id
    and ri.product_id is not null
    and ri.unit_id is not null
    and coalesce(ri.quantity_net, ri.quantity_gross) > 0
  order by ri.sort_order, ri.id;

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
$fn_v3_create_production_order_subrecipes$;

create or replace function public.v3_check_production_feasibility(
  p_hotel_id uuid,
  p_production_order_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_check_production_feasibility_subrecipes$
declare
  v_order record;
  v_deficits jsonb;
  v_chain jsonb;
begin
  perform public.v3_check_membership(auth.uid(), p_hotel_id, null);

  select po.id, po.recipe_id, po.servings
    into v_order
  from public.v3_production_orders po
  where po.id = p_production_order_id
    and po.hotel_id = p_hotel_id;

  if v_order.id is null then
    raise exception 'production order not found' using errcode = 'P0010';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'depth', c.depth,
    'parent_recipe_id', c.parent_recipe_id,
    'recipe_id', c.recipe_id,
    'product_id', c.product_id,
    'unit_id', c.unit_id,
    'required', c.required,
    'available', c.available,
    'missing', c.missing,
    'output_quantity_per_batch', c.output_quantity_per_batch,
    'batches_needed', c.batches_needed,
    'target_servings', c.target_servings,
    'quantity_to_produce', c.quantity_to_produce,
    'will_produce', c.will_produce
  ) order by c.depth, c.parent_recipe_id, c.recipe_id), '[]'::jsonb)
    into v_chain
  from public.v3_compute_subrecipe_chain(p_hotel_id, v_order.recipe_id, v_order.servings, 0) c;

  with chain as materialized (
    select *
    from public.v3_compute_subrecipe_chain(p_hotel_id, v_order.recipe_id, v_order.servings, 0)
  ),
  planned_production as (
    select
      c.product_id,
      sum(c.quantity_to_produce)::numeric(14,4) as planned_quantity
    from chain c
    where c.will_produce = true
    group by c.product_id
  ),
  parent_requirements as (
    select
      l.product_id,
      sum(l.quantity_required)::numeric(14,4) as required
    from public.v3_production_order_lines l
    where l.hotel_id = p_hotel_id
      and l.production_order_id = p_production_order_id
    group by l.product_id
  ),
  subrecipe_requirements as (
    select
      ri.product_id,
      sum(round((coalesce(ri.quantity_net, ri.quantity_gross) * (c.target_servings / r.servings))::numeric, 4))::numeric(14,4) as required
    from chain c
    join public.v3_recipes r
      on r.id = c.recipe_id
     and r.hotel_id = p_hotel_id
    join public.v3_recipe_ingredients ri
      on ri.recipe_id = c.recipe_id
     and ri.hotel_id = p_hotel_id
    where c.will_produce = true
      and ri.product_id is not null
      and ri.unit_id is not null
      and coalesce(ri.quantity_net, ri.quantity_gross) > 0
      and r.servings > 0
    group by ri.product_id
  ),
  requirements as (
    select req.product_id, sum(req.required)::numeric(14,4) as required
    from (
      select product_id, required from parent_requirements
      union all
      select product_id, required from subrecipe_requirements
    ) req
    group by req.product_id
  ),
  available_stock as (
    select
      lot.product_id,
      sum(lot.quantity_remaining)::numeric(14,4) as available
    from public.v3_inventory_lots lot
    join requirements req
      on req.product_id = lot.product_id
    where lot.hotel_id = p_hotel_id
      and lot.quantity_remaining > 0
    group by lot.product_id
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'product_id', deficit.product_id,
    'required', deficit.required,
    'available', deficit.available,
    'missing', deficit.missing
  ) order by deficit.product_id), '[]'::jsonb)
    into v_deficits
  from (
    select
      req.product_id,
      req.required,
      (coalesce(stock.available, 0) + coalesce(plan.planned_quantity, 0))::numeric(14,4) as available,
      (req.required - coalesce(stock.available, 0) - coalesce(plan.planned_quantity, 0))::numeric(14,4) as missing
    from requirements req
    left join available_stock stock
      on stock.product_id = req.product_id
    left join planned_production plan
      on plan.product_id = req.product_id
    where (coalesce(stock.available, 0) + coalesce(plan.planned_quantity, 0)) < req.required
  ) deficit;

  return jsonb_build_object(
    'feasible', jsonb_array_length(v_deficits) = 0,
    'deficits', v_deficits,
    'subrecipe_chain', v_chain
  );
end;
$fn_v3_check_production_feasibility_subrecipes$;

create or replace function public.v3_produce_subrecipe(
  p_hotel_id uuid,
  p_recipe_id uuid,
  p_target_quantity numeric,
  p_origin jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_produce_subrecipe$
declare
  v_recipe record;
  v_batches_needed numeric(14,4);
  v_quantity_to_produce numeric(14,4);
  v_target_servings numeric(14,4);
  v_started jsonb;
  v_sub_order_id uuid;
  v_lines_count integer;
  v_unmapped_count integer;
  v_estimated_total_cost numeric(18,4);
  v_actual_total_cost numeric(18,4);
  v_unit_cost numeric(14,4);
  v_lot_id uuid;
  v_movement_origin jsonb;
begin
  if p_target_quantity is null or p_target_quantity <= 0 then
    raise exception 'target quantity must be > 0' using errcode = 'P0003';
  end if;

  if p_origin is not null and jsonb_typeof(p_origin) <> 'object' then
    raise exception 'origin must be a JSON object' using errcode = 'P0003';
  end if;

  select
    r.id,
    r.servings::numeric as servings,
    r.output_product_id,
    r.output_quantity_per_batch::numeric as output_quantity_per_batch,
    p.default_unit_id as output_unit_id
    into v_recipe
  from public.v3_recipes r
  join public.v3_products p
    on p.id = r.output_product_id
   and p.hotel_id = p_hotel_id
   and p.is_active = true
  where r.id = p_recipe_id
    and r.hotel_id = p_hotel_id
    and r.is_preparation = true
    and r.status not in ('deprecated', 'archived');

  if v_recipe.id is null then
    raise exception 'stockable preparation recipe not found' using errcode = 'P0010';
  end if;

  if v_recipe.servings is null or v_recipe.servings <= 0 then
    raise exception 'preparation recipe servings must be > 0' using errcode = 'P0003';
  end if;

  if v_recipe.output_product_id is null
     or v_recipe.output_unit_id is null
     or v_recipe.output_quantity_per_batch is null
     or v_recipe.output_quantity_per_batch <= 0 then
    raise exception 'preparation recipe output is incomplete' using errcode = 'P0003';
  end if;

  v_batches_needed := ceil(p_target_quantity / v_recipe.output_quantity_per_batch)::numeric(14,4);
  v_quantity_to_produce := (v_batches_needed * v_recipe.output_quantity_per_batch)::numeric(14,4);
  v_target_servings := (v_batches_needed * v_recipe.servings)::numeric(14,4);

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
    raise exception 'preparation recipe has unmapped or invalid ingredients: %', v_unmapped_count
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
    v_target_servings,
    'draft',
    null,
    'Sub-receta on-demand',
    auth.uid()
  )
  returning id into v_sub_order_id;

  insert into public.v3_production_order_lines (
    hotel_id,
    production_order_id,
    product_id,
    source_recipe_id,
    quantity_required,
    unit_id,
    estimated_unit_cost
  )
  select
    p_hotel_id,
    v_sub_order_id,
    ri.product_id,
    ri.source_recipe_id,
    round((coalesce(ri.quantity_net, ri.quantity_gross) * (v_target_servings / v_recipe.servings))::numeric, 4)::numeric(14,4),
    ri.unit_id,
    coalesce(latest_lot.unit_cost, latest_gr.unit_price, 0)::numeric(14,4)
  from public.v3_recipe_ingredients ri
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
  where ri.recipe_id = p_recipe_id
    and ri.hotel_id = p_hotel_id
    and ri.product_id is not null
    and ri.unit_id is not null
    and coalesce(ri.quantity_net, ri.quantity_gross) > 0
  order by ri.sort_order, ri.id;

  select count(*),
         coalesce(sum(l.estimated_total_cost), 0)::numeric(18,4)
    into v_lines_count, v_estimated_total_cost
  from public.v3_production_order_lines l
  where l.hotel_id = p_hotel_id
    and l.production_order_id = v_sub_order_id;

  if v_lines_count = 0 then
    raise exception 'preparation recipe has no producible ingredients'
      using errcode = 'P0003';
  end if;

  update public.v3_production_orders
  set estimated_total_cost = v_estimated_total_cost
  where hotel_id = p_hotel_id
    and id = v_sub_order_id;

  perform public.v3_emit_event(
    p_hotel_id,
    'production_order',
    v_sub_order_id,
    'production.created',
    jsonb_build_object(
      'recipe_id', p_recipe_id,
      'servings', v_target_servings,
      'source', 'subrecipe_production',
      'created_by', auth.uid()
    )
  );

  v_started := public.v3_start_production(p_hotel_id, v_sub_order_id);
  v_actual_total_cost := coalesce((v_started #>> '{order,actual_total_cost}')::numeric, 0)::numeric(18,4);
  v_unit_cost := round(v_actual_total_cost / nullif(v_quantity_to_produce, 0), 4)::numeric(14,4);

  insert into public.v3_inventory_lots (
    hotel_id,
    product_id,
    quantity_received,
    quantity_remaining,
    unit_id,
    unit_cost,
    received_at,
    notes,
    is_preparation,
    production_order_id
  )
  values (
    p_hotel_id,
    v_recipe.output_product_id,
    v_quantity_to_produce,
    v_quantity_to_produce,
    v_recipe.output_unit_id,
    v_unit_cost,
    now(),
    'Lote generado por sub-receta on-demand',
    true,
    v_sub_order_id
  )
  returning id into v_lot_id;

  v_movement_origin :=
    coalesce(p_origin, '{}'::jsonb)
    || jsonb_build_object(
      'source', 'subrecipe_production',
      'production_order_id', v_sub_order_id,
      'recipe_id', p_recipe_id,
      'lot_id', v_lot_id
    );

  insert into public.v3_inventory_movements (
    hotel_id,
    product_id,
    lot_id,
    kind,
    quantity,
    unit_id,
    unit_cost,
    origin,
    recipe_id,
    notes,
    created_by
  )
  values (
    p_hotel_id,
    v_recipe.output_product_id,
    v_lot_id,
    'produce',
    v_quantity_to_produce,
    v_recipe.output_unit_id,
    v_unit_cost,
    v_movement_origin,
    p_recipe_id,
    'Producción de sub-receta on-demand',
    auth.uid()
  );

  return jsonb_build_object(
    'recipe_id', p_recipe_id,
    'production_order_id', v_sub_order_id,
    'product_id', v_recipe.output_product_id,
    'unit_id', v_recipe.output_unit_id,
    'target_quantity', p_target_quantity,
    'quantity_produced', v_quantity_to_produce,
    'batches_needed', v_batches_needed,
    'total_cost', v_actual_total_cost,
    'unit_cost', v_unit_cost,
    'lot_id', v_lot_id,
    'origin', v_movement_origin,
    'order', v_started
  );
end;
$fn_v3_produce_subrecipe$;

create or replace function public.v3_start_production(
  p_hotel_id uuid,
  p_production_order_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_start_production_subrecipes$
declare
  v_order record;
  v_line record;
  v_chain record;
  v_result jsonb;
  v_feasibility jsonb;
  v_actual_total_cost numeric(18,4) := 0;
  v_subrecipe_productions jsonb := '[]'::jsonb;
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

  v_feasibility := public.v3_check_production_feasibility(p_hotel_id, p_production_order_id);

  if coalesce((v_feasibility ->> 'feasible')::boolean, false) = false then
    raise exception 'insufficient stock for production order %', p_production_order_id
      using errcode = 'P0002',
            detail = v_feasibility::text;
  end if;

  for v_chain in
    select *
    from public.v3_compute_subrecipe_chain(p_hotel_id, v_order.recipe_id, v_order.servings, 0) chain
    where chain.will_produce = true
    order by chain.depth desc, chain.parent_recipe_id, chain.recipe_id
  loop
    v_result := public.v3_produce_subrecipe(
      p_hotel_id,
      v_chain.recipe_id,
      v_chain.missing,
      jsonb_build_object(
        'parent_production_order_id', p_production_order_id,
        'parent_recipe_id', v_order.recipe_id,
        'required_product_id', v_chain.product_id,
        'required_quantity', v_chain.required,
        'missing_quantity', v_chain.missing,
        'cascade_depth', v_chain.depth
      )
    );

    v_subrecipe_productions := v_subrecipe_productions || jsonb_build_array(v_result);
  end loop;

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
            detail = v_feasibility::text;
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
        'recipe_id', v_order.recipe_id,
        'source_recipe_id', v_line.source_recipe_id
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
      'subrecipe_productions', v_subrecipe_productions,
      'started_by', auth.uid()
    )
  );

  return public.v3_get_production_order(p_hotel_id, p_production_order_id)
    || jsonb_build_object('subrecipe_productions', v_subrecipe_productions);
end;
$fn_v3_start_production_subrecipes$;

create or replace function public.v3_get_production_order(
  p_hotel_id uuid,
  p_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_get_production_order_subrecipes$
declare
  v_order jsonb;
  v_lines jsonb;
  v_movements jsonb;
  v_subrecipe_productions jsonb;
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
    'source_recipe_id', l.source_recipe_id,
    'source_recipe_name', sr.name,
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
  left join public.v3_recipes sr
    on sr.id = l.source_recipe_id
   and sr.hotel_id = p_hotel_id
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

  select coalesce(jsonb_agg(jsonb_build_object(
    'movement_id', m.id,
    'production_order_id', m.origin ->> 'production_order_id',
    'recipe_id', m.recipe_id,
    'product_id', m.product_id,
    'product_name', p.name,
    'lot_id', m.lot_id,
    'quantity_produced', m.quantity,
    'unit_id', m.unit_id,
    'unit_name', u.name,
    'unit_abbreviation', u.abbreviation,
    'unit_cost', m.unit_cost,
    'total_cost', m.total_cost,
    'origin', m.origin,
    'created_at', m.created_at
  ) order by m.created_at, m.id), '[]'::jsonb)
    into v_subrecipe_productions
  from public.v3_inventory_movements m
  join public.v3_products p
    on p.id = m.product_id
   and p.hotel_id = p_hotel_id
  join public.v3_units_of_measure u
    on u.id = m.unit_id
   and u.hotel_id = p_hotel_id
  where m.hotel_id = p_hotel_id
    and m.origin ->> 'source' = 'subrecipe_production'
    and m.origin ->> 'parent_production_order_id' = p_id::text;

  return jsonb_build_object(
    'order', v_order,
    'lines', v_lines,
    'movements', v_movements,
    'subrecipe_productions', v_subrecipe_productions
  );
end;
$fn_v3_get_production_order_subrecipes$;

revoke all on function public.v3_create_production_order(uuid, uuid, numeric, timestamptz, text) from public, anon, authenticated;
grant execute on function public.v3_create_production_order(uuid, uuid, numeric, timestamptz, text) to authenticated;

revoke all on function public.v3_check_production_feasibility(uuid, uuid) from public, anon, authenticated;
grant execute on function public.v3_check_production_feasibility(uuid, uuid) to authenticated;

revoke all on function public.v3_produce_subrecipe(uuid, uuid, numeric, jsonb) from public, anon, authenticated;
grant execute on function public.v3_produce_subrecipe(uuid, uuid, numeric, jsonb) to postgres, service_role;

revoke all on function public.v3_start_production(uuid, uuid) from public, anon, authenticated;
grant execute on function public.v3_start_production(uuid, uuid) to authenticated;

revoke all on function public.v3_get_production_order(uuid, uuid) from public, anon, authenticated;
grant execute on function public.v3_get_production_order(uuid, uuid) to authenticated;
