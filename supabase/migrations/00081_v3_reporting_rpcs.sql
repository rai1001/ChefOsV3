-- 00081_v3_reporting_rpcs.sql
-- Sprint-09 - read-only reporting RPCs.
-- ADR-0015: all v3-owned DB objects are prefixed with v3_.

create or replace function public.v3_report_food_cost_by_recipe(
  p_hotel_id uuid,
  p_from timestamptz,
  p_to timestamptz,
  p_recipe_id uuid default null
)
returns table (
  recipe_id uuid,
  recipe_name text,
  production_orders_count bigint,
  total_servings_produced numeric,
  total_estimated_cost numeric,
  total_actual_cost numeric,
  cost_variance_pct numeric,
  avg_actual_cost_per_serving numeric
)
language plpgsql
security definer
set search_path = public
as $fn_v3_report_food_cost_by_recipe$
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['direction','admin','head_chef','sous_chef','procurement']::public.v3_app_role[]
  );

  return query
  with order_costs as (
    select
      po.id,
      po.recipe_id,
      po.servings,
      coalesce(sum(pol.estimated_total_cost), 0)::numeric(18,4) as estimated_cost,
      coalesce(sum(pol.actual_total_cost), 0)::numeric(18,4) as actual_cost
    from public.v3_production_orders po
    left join public.v3_production_order_lines pol
      on pol.hotel_id = po.hotel_id
     and pol.production_order_id = po.id
    where po.hotel_id = p_hotel_id
      and po.status in ('in_progress', 'completed')
      and po.started_at is not null
      and (p_from is null or po.started_at >= p_from)
      and (p_to is null or po.started_at < p_to)
      and (p_recipe_id is null or po.recipe_id = p_recipe_id)
    group by po.id, po.recipe_id, po.servings
  ),
  recipe_costs as (
    select
      oc.recipe_id,
      count(*)::bigint as production_orders_count,
      coalesce(sum(oc.servings), 0)::numeric(14,4) as total_servings_produced,
      coalesce(sum(oc.estimated_cost), 0)::numeric(18,4) as total_estimated_cost,
      coalesce(sum(oc.actual_cost), 0)::numeric(18,4) as total_actual_cost
    from order_costs oc
    group by oc.recipe_id
  )
  select
    rc.recipe_id,
    r.name as recipe_name,
    rc.production_orders_count,
    rc.total_servings_produced,
    rc.total_estimated_cost,
    rc.total_actual_cost,
    case
      when rc.total_estimated_cost = 0 then null
      else round(((rc.total_actual_cost - rc.total_estimated_cost) / rc.total_estimated_cost) * 100, 4)
    end as cost_variance_pct,
    case
      when rc.total_servings_produced = 0 then null
      else round(rc.total_actual_cost / rc.total_servings_produced, 4)
    end as avg_actual_cost_per_serving
  from recipe_costs rc
  join public.v3_recipes r
    on r.id = rc.recipe_id
   and r.hotel_id = p_hotel_id
  order by rc.total_actual_cost desc, r.name asc;
end;
$fn_v3_report_food_cost_by_recipe$;

create or replace function public.v3_report_waste_by_period(
  p_hotel_id uuid,
  p_from timestamptz,
  p_to timestamptz,
  p_product_id uuid default null
)
returns table (
  product_id uuid,
  product_name text,
  category_id uuid,
  total_quantity_wasted numeric,
  total_cost_wasted numeric,
  movements_count bigint,
  pct_of_consume numeric
)
language plpgsql
security definer
set search_path = public
as $fn_v3_report_waste_by_period$
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['direction','admin','head_chef','sous_chef','procurement']::public.v3_app_role[]
  );

  return query
  with movement_totals as (
    select
      im.product_id,
      coalesce(sum(im.quantity) filter (where im.kind = 'waste'), 0)::numeric(14,4) as quantity_wasted,
      coalesce(sum(im.total_cost) filter (where im.kind = 'waste'), 0)::numeric(18,4) as cost_wasted,
      count(*) filter (where im.kind = 'waste')::bigint as waste_movements_count,
      coalesce(sum(im.quantity) filter (where im.kind = 'consume'), 0)::numeric(14,4) as quantity_consumed
    from public.v3_inventory_movements im
    where im.hotel_id = p_hotel_id
      and im.kind in ('consume', 'waste')
      and (p_from is null or im.created_at >= p_from)
      and (p_to is null or im.created_at < p_to)
      and (p_product_id is null or im.product_id = p_product_id)
    group by im.product_id
  )
  select
    mt.product_id,
    p.name as product_name,
    p.category_id,
    mt.quantity_wasted as total_quantity_wasted,
    mt.cost_wasted as total_cost_wasted,
    mt.waste_movements_count as movements_count,
    case
      when (mt.quantity_consumed + mt.quantity_wasted) = 0 then null
      else round((mt.quantity_wasted / (mt.quantity_consumed + mt.quantity_wasted)) * 100, 4)
    end as pct_of_consume
  from movement_totals mt
  join public.v3_products p
    on p.id = mt.product_id
   and p.hotel_id = p_hotel_id
  where mt.quantity_wasted > 0
  order by mt.cost_wasted desc, p.name asc;
end;
$fn_v3_report_waste_by_period$;

create or replace function public.v3_report_top_products(
  p_hotel_id uuid,
  p_from timestamptz,
  p_to timestamptz,
  p_dimension text,
  p_limit integer default 20
)
returns table (
  product_id uuid,
  product_name text,
  category_id uuid,
  metric_value numeric,
  metric_secondary numeric,
  rank integer
)
language plpgsql
security definer
set search_path = public
as $fn_v3_report_top_products$
declare
  v_limit integer := least(greatest(coalesce(p_limit, 20), 1), 100);
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['direction','admin','head_chef','sous_chef','procurement']::public.v3_app_role[]
  );

  if p_dimension is null
     or p_dimension not in ('consumed_value', 'consumed_quantity', 'wasted_value', 'price_volatility') then
    raise exception 'invalid reporting dimension: %', p_dimension using errcode = 'P0003';
  end if;

  if p_dimension = 'consumed_value' then
    return query
    with metrics as (
      select
        im.product_id,
        coalesce(sum(im.total_cost), 0)::numeric(18,4) as metric_value,
        coalesce(sum(im.quantity), 0)::numeric(14,4) as metric_secondary
      from public.v3_inventory_movements im
      where im.hotel_id = p_hotel_id
        and im.kind = 'consume'
        and (p_from is null or im.created_at >= p_from)
        and (p_to is null or im.created_at < p_to)
      group by im.product_id
    ),
    ranked as (
      select
        m.product_id,
        p.name as product_name,
        p.category_id,
        m.metric_value,
        m.metric_secondary,
        row_number() over (order by m.metric_value desc, p.name asc)::integer as rank
      from metrics m
      join public.v3_products p
        on p.id = m.product_id
       and p.hotel_id = p_hotel_id
      where m.metric_value > 0
    )
    select
      r.product_id,
      r.product_name,
      r.category_id,
      r.metric_value,
      r.metric_secondary,
      r.rank
    from ranked r
    order by r.rank
    limit v_limit;

    return;
  end if;

  if p_dimension = 'consumed_quantity' then
    return query
    with metrics as (
      select
        im.product_id,
        coalesce(sum(im.quantity), 0)::numeric(14,4) as metric_value,
        coalesce(sum(im.total_cost), 0)::numeric(18,4) as metric_secondary
      from public.v3_inventory_movements im
      where im.hotel_id = p_hotel_id
        and im.kind = 'consume'
        and (p_from is null or im.created_at >= p_from)
        and (p_to is null or im.created_at < p_to)
      group by im.product_id
    ),
    ranked as (
      select
        m.product_id,
        p.name as product_name,
        p.category_id,
        m.metric_value,
        m.metric_secondary,
        row_number() over (order by m.metric_value desc, p.name asc)::integer as rank
      from metrics m
      join public.v3_products p
        on p.id = m.product_id
       and p.hotel_id = p_hotel_id
      where m.metric_value > 0
    )
    select
      r.product_id,
      r.product_name,
      r.category_id,
      r.metric_value,
      r.metric_secondary,
      r.rank
    from ranked r
    order by r.rank
    limit v_limit;

    return;
  end if;

  if p_dimension = 'wasted_value' then
    return query
    with metrics as (
      select
        im.product_id,
        coalesce(sum(im.total_cost), 0)::numeric(18,4) as metric_value,
        coalesce(sum(im.quantity), 0)::numeric(14,4) as metric_secondary
      from public.v3_inventory_movements im
      where im.hotel_id = p_hotel_id
        and im.kind = 'waste'
        and (p_from is null or im.created_at >= p_from)
        and (p_to is null or im.created_at < p_to)
      group by im.product_id
    ),
    ranked as (
      select
        m.product_id,
        p.name as product_name,
        p.category_id,
        m.metric_value,
        m.metric_secondary,
        row_number() over (order by m.metric_value desc, p.name asc)::integer as rank
      from metrics m
      join public.v3_products p
        on p.id = m.product_id
       and p.hotel_id = p_hotel_id
      where m.metric_value > 0
    )
    select
      r.product_id,
      r.product_name,
      r.category_id,
      r.metric_value,
      r.metric_secondary,
      r.rank
    from ranked r
    order by r.rank
    limit v_limit;

    return;
  end if;

  return query
  with metrics as (
    select
      pcl.product_id,
      round(avg(abs(pcl.delta_pct)), 4)::numeric(12,4) as metric_value,
      count(*)::numeric as metric_secondary
    from public.v3_price_change_log pcl
    where pcl.hotel_id = p_hotel_id
      and pcl.delta_pct is not null
      and (p_from is null or pcl.detected_at >= p_from)
      and (p_to is null or pcl.detected_at < p_to)
    group by pcl.product_id
  ),
  ranked as (
    select
      m.product_id,
      p.name as product_name,
      p.category_id,
      m.metric_value,
      m.metric_secondary,
      row_number() over (order by m.metric_value desc, p.name asc)::integer as rank
    from metrics m
    join public.v3_products p
      on p.id = m.product_id
     and p.hotel_id = p_hotel_id
    where m.metric_value > 0
  )
  select
    r.product_id,
    r.product_name,
    r.category_id,
    r.metric_value,
    r.metric_secondary,
    r.rank
  from ranked r
  order by r.rank
  limit v_limit;
end;
$fn_v3_report_top_products$;

create or replace function public.v3_report_price_changes(
  p_hotel_id uuid,
  p_from timestamptz,
  p_to timestamptz,
  p_supplier_id uuid default null,
  p_product_id uuid default null,
  p_limit integer default 200
)
returns table (
  price_change_id uuid,
  product_id uuid,
  product_name text,
  supplier_id uuid,
  supplier_name text,
  purchase_order_line_id uuid,
  old_price numeric,
  new_price numeric,
  delta_pct numeric,
  source text,
  detected_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $fn_v3_report_price_changes$
declare
  v_limit integer := least(greatest(coalesce(p_limit, 200), 1), 200);
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['direction','admin','head_chef','sous_chef','procurement']::public.v3_app_role[]
  );

  return query
  select
    pcl.id as price_change_id,
    pcl.product_id,
    p.name as product_name,
    po.supplier_id,
    s.name as supplier_name,
    pcl.purchase_order_line_id,
    pcl.old_price,
    pcl.new_price,
    pcl.delta_pct,
    pcl.source,
    pcl.detected_at,
    pcl.created_at
  from public.v3_price_change_log pcl
  join public.v3_products p
    on p.id = pcl.product_id
   and p.hotel_id = p_hotel_id
  left join public.v3_purchase_order_lines pol
    on pol.id = pcl.purchase_order_line_id
   and pol.hotel_id = p_hotel_id
  left join public.v3_purchase_orders po
    on po.id = pol.purchase_order_id
   and po.hotel_id = p_hotel_id
  left join public.v3_suppliers s
    on s.id = po.supplier_id
   and s.hotel_id = p_hotel_id
  where pcl.hotel_id = p_hotel_id
    and (p_from is null or pcl.detected_at >= p_from)
    and (p_to is null or pcl.detected_at < p_to)
    and (p_supplier_id is null or po.supplier_id = p_supplier_id)
    and (p_product_id is null or pcl.product_id = p_product_id)
  order by pcl.detected_at desc, pcl.id desc
  limit v_limit;
end;
$fn_v3_report_price_changes$;

create or replace function public.v3_report_stock_health(
  p_hotel_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_report_stock_health$
declare
  v_summary jsonb;
  v_expiring_soon jsonb;
  v_dead_stock jsonb;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['direction','admin','head_chef','sous_chef','procurement']::public.v3_app_role[]
  );

  with active_lots as (
    select
      lot.product_id,
      lot.quantity_remaining,
      lot.unit_cost,
      lot.is_preparation,
      lot.id
    from public.v3_inventory_lots lot
    where lot.hotel_id = p_hotel_id
      and lot.quantity_remaining > 0
  )
  select jsonb_build_object(
    'total_products_with_stock', coalesce(count(distinct al.product_id), 0),
    'total_qty_on_hand', round(coalesce(sum(al.quantity_remaining), 0), 4),
    'total_stock_value', round(coalesce(sum(al.quantity_remaining * al.unit_cost), 0), 4),
    'total_lots_active', coalesce(count(al.id), 0),
    'total_preparation_lots_active', coalesce(count(al.id) filter (where al.is_preparation = true), 0)
  )
    into v_summary
  from active_lots al;

  select coalesce(jsonb_agg(jsonb_build_object(
    'lot_id', expiring.id,
    'product_id', expiring.product_id,
    'product_name', expiring.product_name,
    'category_id', expiring.category_id,
    'quantity_remaining', expiring.quantity_remaining,
    'unit_id', expiring.unit_id,
    'unit_name', expiring.unit_name,
    'unit_abbreviation', expiring.unit_abbreviation,
    'unit_cost', expiring.unit_cost,
    'stock_value', expiring.stock_value,
    'received_at', expiring.received_at,
    'expires_at', expiring.expires_at,
    'days_to_expiry', expiring.days_to_expiry,
    'is_preparation', expiring.is_preparation,
    'production_order_id', expiring.production_order_id
  ) order by expiring.expires_at asc, expiring.id asc), '[]'::jsonb)
    into v_expiring_soon
  from (
    select
      lot.id,
      lot.product_id,
      p.name as product_name,
      p.category_id,
      lot.quantity_remaining,
      lot.unit_id,
      u.name as unit_name,
      u.abbreviation as unit_abbreviation,
      lot.unit_cost,
      round(lot.quantity_remaining * lot.unit_cost, 4) as stock_value,
      lot.received_at,
      lot.expires_at,
      ceiling(extract(epoch from (lot.expires_at - now())) / 86400)::integer as days_to_expiry,
      lot.is_preparation,
      lot.production_order_id
    from public.v3_inventory_lots lot
    join public.v3_products p
      on p.id = lot.product_id
     and p.hotel_id = p_hotel_id
    join public.v3_units_of_measure u
      on u.id = lot.unit_id
     and u.hotel_id = p_hotel_id
    where lot.hotel_id = p_hotel_id
      and lot.quantity_remaining > 0
      and lot.expires_at is not null
    order by lot.expires_at asc, lot.id asc
    limit 10
  ) expiring;

  with product_stock as (
    select
      lot.product_id,
      coalesce(sum(lot.quantity_remaining), 0)::numeric(14,4) as qty_on_hand,
      coalesce(sum(lot.quantity_remaining * lot.unit_cost), 0)::numeric(18,4) as stock_value,
      count(lot.id)::bigint as lots_count
    from public.v3_inventory_lots lot
    where lot.hotel_id = p_hotel_id
      and lot.quantity_remaining > 0
    group by lot.product_id
  ),
  last_consume as (
    select
      im.product_id,
      max(im.created_at) as last_consumed_at
    from public.v3_inventory_movements im
    where im.hotel_id = p_hotel_id
      and im.kind = 'consume'
    group by im.product_id
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'product_id', ps.product_id,
    'product_name', p.name,
    'category_id', p.category_id,
    'qty_on_hand', ps.qty_on_hand,
    'stock_value', ps.stock_value,
    'lots_count', ps.lots_count,
    'last_consumed_at', lc.last_consumed_at
  ) order by ps.stock_value desc, p.name asc), '[]'::jsonb)
    into v_dead_stock
  from product_stock ps
  join public.v3_products p
    on p.id = ps.product_id
   and p.hotel_id = p_hotel_id
  left join last_consume lc
    on lc.product_id = ps.product_id
  where lc.last_consumed_at is null
     or lc.last_consumed_at < now() - interval '30 days';

  return jsonb_build_object(
    'summary', coalesce(v_summary, jsonb_build_object(
      'total_products_with_stock', 0,
      'total_qty_on_hand', 0,
      'total_stock_value', 0,
      'total_lots_active', 0,
      'total_preparation_lots_active', 0
    )),
    'expiring_soon', coalesce(v_expiring_soon, '[]'::jsonb),
    'dead_stock', coalesce(v_dead_stock, '[]'::jsonb)
  );
end;
$fn_v3_report_stock_health$;

revoke all on function public.v3_report_food_cost_by_recipe(uuid, timestamptz, timestamptz, uuid) from public, anon, authenticated;
grant execute on function public.v3_report_food_cost_by_recipe(uuid, timestamptz, timestamptz, uuid) to authenticated;

revoke all on function public.v3_report_waste_by_period(uuid, timestamptz, timestamptz, uuid) from public, anon, authenticated;
grant execute on function public.v3_report_waste_by_period(uuid, timestamptz, timestamptz, uuid) to authenticated;

revoke all on function public.v3_report_top_products(uuid, timestamptz, timestamptz, text, integer) from public, anon, authenticated;
grant execute on function public.v3_report_top_products(uuid, timestamptz, timestamptz, text, integer) to authenticated;

revoke all on function public.v3_report_price_changes(uuid, timestamptz, timestamptz, uuid, uuid, integer) from public, anon, authenticated;
grant execute on function public.v3_report_price_changes(uuid, timestamptz, timestamptz, uuid, uuid, integer) to authenticated;

revoke all on function public.v3_report_stock_health(uuid) from public, anon, authenticated;
grant execute on function public.v3_report_stock_health(uuid) to authenticated;
