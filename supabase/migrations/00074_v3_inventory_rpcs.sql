-- 00074_v3_inventory_rpcs.sql
-- Sprint-06 · FIFO consume, waste, adjustments, snapshot and movements.
-- ADR-0015: all v3-owned DB objects are prefixed with v3_.

-- Internal helper. Public/user-facing RPCs perform v3_check_membership before
-- calling it; direct execution is restricted by grants.
create or replace function public.v3_decrement_inventory_fifo(
  p_hotel_id uuid,
  p_product_id uuid,
  p_quantity numeric,
  p_kind public.v3_inventory_movement_kind,
  p_origin jsonb default '{}'::jsonb,
  p_notes text default null,
  p_created_by uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_decrement_inventory_fifo$
declare
  v_remaining numeric(14,4);
  v_lot record;
  v_take numeric(14,4);
  v_total_cost numeric(18,4) := 0;
  v_consumed_lots jsonb := '[]'::jsonb;
begin
  if p_kind not in ('consume', 'waste', 'adjust_out') then
    raise exception 'unsupported FIFO decrement kind: %', p_kind using errcode = 'P0003';
  end if;

  if p_quantity is null or p_quantity <= 0 then
    raise exception 'quantity must be > 0' using errcode = 'P0003';
  end if;

  if p_origin is not null and jsonb_typeof(p_origin) <> 'object' then
    raise exception 'origin must be a JSON object' using errcode = 'P0003';
  end if;

  set local lock_timeout = '5s';
  v_remaining := p_quantity::numeric(14,4);

  for v_lot in
    select *
    from public.v3_inventory_lots
    where hotel_id = p_hotel_id
      and product_id = p_product_id
      and quantity_remaining > 0
    order by received_at asc, id asc
    for update
  loop
    exit when v_remaining <= 0;

    v_take := least(v_remaining, v_lot.quantity_remaining)::numeric(14,4);

    update public.v3_inventory_lots
    set quantity_remaining = quantity_remaining - v_take,
        updated_at = now()
    where id = v_lot.id
      and hotel_id = p_hotel_id;

    insert into public.v3_inventory_movements (
      hotel_id,
      product_id,
      lot_id,
      kind,
      quantity,
      unit_id,
      unit_cost,
      origin,
      notes,
      created_by
    )
    values (
      p_hotel_id,
      p_product_id,
      v_lot.id,
      p_kind,
      v_take,
      v_lot.unit_id,
      v_lot.unit_cost,
      coalesce(p_origin, '{}'::jsonb),
      p_notes,
      p_created_by
    );

    v_consumed_lots := v_consumed_lots || jsonb_build_array(jsonb_build_object(
      'lot_id', v_lot.id,
      'quantity', v_take,
      'unit_cost', v_lot.unit_cost,
      'total_cost', round(v_take * v_lot.unit_cost, 4)
    ));

    v_total_cost := v_total_cost + (v_take * v_lot.unit_cost);
    v_remaining := v_remaining - v_take;
  end loop;

  if v_remaining > 0 then
    raise exception 'insufficient stock for product %, requested %, missing %',
      p_product_id, p_quantity, v_remaining
      using errcode = 'P0002';
  end if;

  return jsonb_build_object(
    'product_id', p_product_id,
    'quantity', p_quantity,
    'consumed_lots', v_consumed_lots,
    'total_cost', round(v_total_cost, 4),
    'weighted_unit_cost', round(v_total_cost / nullif(p_quantity, 0), 4)
  );
end;
$fn_v3_decrement_inventory_fifo$;

create or replace function public.v3_register_lot_from_receipt(
  p_hotel_id uuid,
  p_goods_receipt_line_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $fn_v3_register_lot_from_receipt$
declare
  v_line record;
  v_existing_lot_id uuid;
  v_lot_id uuid;
  v_unit_id uuid;
begin
  select id
    into v_existing_lot_id
  from public.v3_inventory_lots
  where hotel_id = p_hotel_id
    and goods_receipt_line_id = p_goods_receipt_line_id;

  if v_existing_lot_id is not null then
    return v_existing_lot_id;
  end if;

  select
    grl.*,
    gr.received_at as goods_received_at,
    p.default_unit_id
    into v_line
  from public.v3_goods_receipt_lines grl
  join public.v3_goods_receipts gr
    on gr.id = grl.goods_receipt_id
   and gr.hotel_id = p_hotel_id
  join public.v3_products p
    on p.id = grl.product_id
   and p.hotel_id = p_hotel_id
  where grl.id = p_goods_receipt_line_id
    and grl.hotel_id = p_hotel_id;

  if v_line.id is null then
    raise exception 'goods receipt line not found' using errcode = 'P0010';
  end if;

  if v_line.quality_status = 'rejected' or v_line.quantity_received <= 0 then
    return null;
  end if;

  v_unit_id := coalesce(v_line.unit_id, v_line.default_unit_id);

  if v_unit_id is null then
    raise exception 'goods receipt line has no unit_id and product has no default_unit_id'
      using errcode = 'P0003';
  end if;

  insert into public.v3_inventory_lots (
    hotel_id,
    product_id,
    goods_receipt_line_id,
    quantity_received,
    quantity_remaining,
    unit_id,
    unit_cost,
    received_at,
    expires_at,
    notes
  )
  values (
    p_hotel_id,
    v_line.product_id,
    v_line.id,
    v_line.quantity_received::numeric(14,4),
    v_line.quantity_received::numeric(14,4),
    v_unit_id,
    v_line.unit_price::numeric(14,4),
    v_line.goods_received_at,
    case when v_line.expiry_date is not null then v_line.expiry_date::timestamptz else null end,
    v_line.notes
  )
  returning id into v_lot_id;

  insert into public.v3_inventory_movements (
    hotel_id,
    product_id,
    lot_id,
    kind,
    quantity,
    unit_id,
    unit_cost,
    origin,
    goods_receipt_line_id,
    notes,
    created_by,
    created_at
  )
  values (
    p_hotel_id,
    v_line.product_id,
    v_lot_id,
    'receive',
    v_line.quantity_received::numeric(14,4),
    v_unit_id,
    v_line.unit_price::numeric(14,4),
    jsonb_build_object(
      'source', 'goods_receipt',
      'goods_receipt_id', v_line.goods_receipt_id,
      'purchase_order_line_id', v_line.purchase_order_line_id,
      'quality_status', v_line.quality_status,
      'lot_number', v_line.lot_number
    ),
    v_line.id,
    v_line.notes,
    auth.uid(),
    v_line.goods_received_at
  );

  return v_lot_id;
exception
  when unique_violation then
    select id
      into v_existing_lot_id
    from public.v3_inventory_lots
    where hotel_id = p_hotel_id
      and goods_receipt_line_id = p_goods_receipt_line_id;

    if v_existing_lot_id is not null then
      return v_existing_lot_id;
    end if;

    raise;
end;
$fn_v3_register_lot_from_receipt$;

create or replace function public.v3_consume_inventory(
  p_hotel_id uuid,
  p_product_id uuid,
  p_quantity numeric,
  p_origin jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_consume_inventory$
declare
  v_product_id uuid;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef','sous_chef','cook']::public.v3_app_role[]
  );

  select id into v_product_id
  from public.v3_products
  where id = p_product_id
    and hotel_id = p_hotel_id
    and is_active = true;

  if v_product_id is null then
    raise exception 'inventory product not found' using errcode = 'P0010';
  end if;

  if p_origin is not null and jsonb_typeof(p_origin) <> 'object' then
    raise exception 'origin must be a JSON object' using errcode = 'P0003';
  end if;

  return public.v3_decrement_inventory_fifo(
    p_hotel_id,
    p_product_id,
    p_quantity,
    'consume',
    coalesce(p_origin, '{}'::jsonb),
    null,
    auth.uid()
  );
end;
$fn_v3_consume_inventory$;

create or replace function public.v3_register_waste(
  p_hotel_id uuid,
  p_product_id uuid,
  p_quantity numeric,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_register_waste$
declare
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
  v_product_id uuid;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef','sous_chef','warehouse']::public.v3_app_role[]
  );

  if v_reason is null then
    raise exception 'waste reason is required' using errcode = 'P0003';
  end if;

  select id into v_product_id
  from public.v3_products
  where id = p_product_id
    and hotel_id = p_hotel_id
    and is_active = true;

  if v_product_id is null then
    raise exception 'inventory product not found' using errcode = 'P0010';
  end if;

  return public.v3_decrement_inventory_fifo(
    p_hotel_id,
    p_product_id,
    p_quantity,
    'waste',
    jsonb_build_object('source', 'manual_waste', 'reason', v_reason),
    v_reason,
    auth.uid()
  );
end;
$fn_v3_register_waste$;

create or replace function public.v3_register_adjustment(
  p_hotel_id uuid,
  p_product_id uuid,
  p_quantity_delta numeric,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_register_adjustment$
declare
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
  v_product record;
  v_unit_id uuid;
  v_unit_cost numeric(14,4);
  v_lot_id uuid;
  v_abs_quantity numeric(14,4);
  v_result jsonb;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef']::public.v3_app_role[]
  );

  if v_reason is null then
    raise exception 'adjustment reason is required' using errcode = 'P0003';
  end if;

  if p_quantity_delta is null or p_quantity_delta = 0 then
    raise exception 'quantity_delta must be different from 0' using errcode = 'P0003';
  end if;

  select *
    into v_product
  from public.v3_products
  where id = p_product_id
    and hotel_id = p_hotel_id
    and is_active = true;

  if v_product.id is null then
    raise exception 'inventory product not found' using errcode = 'P0010';
  end if;

  if p_quantity_delta > 0 then
    select unit_id, unit_cost
      into v_unit_id, v_unit_cost
    from public.v3_inventory_lots
    where hotel_id = p_hotel_id
      and product_id = p_product_id
    order by received_at desc, id desc
    limit 1;

    if v_unit_id is null then
      select coalesce(grl.unit_id, v_product.default_unit_id), grl.unit_price
        into v_unit_id, v_unit_cost
      from public.v3_goods_receipt_lines grl
      join public.v3_goods_receipts gr
        on gr.id = grl.goods_receipt_id
       and gr.hotel_id = p_hotel_id
      where grl.hotel_id = p_hotel_id
        and grl.product_id = p_product_id
        and grl.quality_status <> 'rejected'
        and grl.quantity_received > 0
      order by gr.received_at desc, grl.created_at desc
      limit 1;
    end if;

    v_unit_id := coalesce(v_unit_id, v_product.default_unit_id);
    v_unit_cost := coalesce(v_unit_cost, 0);

    if v_unit_id is null then
      raise exception 'product default_unit_id is required for positive adjustment'
        using errcode = 'P0003';
    end if;

    insert into public.v3_inventory_lots (
      hotel_id,
      product_id,
      quantity_received,
      quantity_remaining,
      unit_id,
      unit_cost,
      received_at,
      notes
    )
    values (
      p_hotel_id,
      p_product_id,
      p_quantity_delta::numeric(14,4),
      p_quantity_delta::numeric(14,4),
      v_unit_id,
      v_unit_cost,
      now(),
      v_reason
    )
    returning id into v_lot_id;

    insert into public.v3_inventory_movements (
      hotel_id,
      product_id,
      lot_id,
      kind,
      quantity,
      unit_id,
      unit_cost,
      origin,
      notes,
      created_by
    )
    values (
      p_hotel_id,
      p_product_id,
      v_lot_id,
      'adjust_in',
      p_quantity_delta::numeric(14,4),
      v_unit_id,
      v_unit_cost,
      jsonb_build_object('source', 'manual_adjustment', 'reason', v_reason),
      v_reason,
      auth.uid()
    );

    return jsonb_build_object(
      'product_id', p_product_id,
      'lot_id', v_lot_id,
      'quantity_delta', p_quantity_delta,
      'movement_kind', 'adjust_in',
      'total_cost', round(p_quantity_delta * v_unit_cost, 4),
      'weighted_unit_cost', v_unit_cost
    );
  end if;

  v_abs_quantity := abs(p_quantity_delta)::numeric(14,4);
  v_result := public.v3_decrement_inventory_fifo(
    p_hotel_id,
    p_product_id,
    v_abs_quantity,
    'adjust_out',
    jsonb_build_object('source', 'manual_adjustment', 'reason', v_reason),
    v_reason,
    auth.uid()
  );

  return v_result || jsonb_build_object(
    'quantity_delta', p_quantity_delta,
    'movement_kind', 'adjust_out'
  );
end;
$fn_v3_register_adjustment$;

create or replace function public.v3_get_inventory_snapshot(
  p_hotel_id uuid
)
returns table (
  product_id uuid,
  name text,
  category_id uuid,
  qty_on_hand numeric,
  valor_stock numeric,
  lots_count bigint,
  last_received_at timestamptz,
  last_unit_cost numeric
)
language plpgsql
security definer
set search_path = public
as $fn_v3_get_inventory_snapshot$
begin
  perform public.v3_check_membership(auth.uid(), p_hotel_id, null);

  return query
  select
    p.id as product_id,
    p.name,
    p.category_id,
    coalesce(sum(l.quantity_remaining), 0)::numeric(14,4) as qty_on_hand,
    coalesce(sum(l.quantity_remaining * l.unit_cost), 0)::numeric(18,4) as valor_stock,
    count(l.id) filter (where l.quantity_remaining > 0) as lots_count,
    max(l.received_at) filter (where l.quantity_remaining > 0) as last_received_at,
    latest.unit_cost as last_unit_cost
  from public.v3_products p
  left join public.v3_inventory_lots l
    on l.hotel_id = p_hotel_id
   and l.product_id = p.id
   and l.quantity_remaining > 0
  left join lateral (
    select lot.unit_cost
    from public.v3_inventory_lots lot
    where lot.hotel_id = p_hotel_id
      and lot.product_id = p.id
    order by lot.received_at desc, lot.id desc
    limit 1
  ) latest on true
  where p.hotel_id = p_hotel_id
    and p.is_active = true
  group by p.id, p.name, p.category_id, latest.unit_cost
  order by p.name asc;
end;
$fn_v3_get_inventory_snapshot$;

create or replace function public.v3_get_inventory_movements(
  p_hotel_id uuid,
  p_product_id uuid,
  p_limit integer default 50,
  p_offset integer default 0
)
returns setof public.v3_inventory_movements
language plpgsql
security definer
set search_path = public
as $fn_v3_get_inventory_movements$
begin
  perform public.v3_check_membership(auth.uid(), p_hotel_id, null);

  return query
  select *
  from public.v3_inventory_movements
  where hotel_id = p_hotel_id
    and (p_product_id is null or product_id = p_product_id)
  order by created_at desc, id desc
  limit least(greatest(coalesce(p_limit, 50), 1), 100)
  offset greatest(coalesce(p_offset, 0), 0);
end;
$fn_v3_get_inventory_movements$;

revoke all on function public.v3_decrement_inventory_fifo(uuid, uuid, numeric, public.v3_inventory_movement_kind, jsonb, text, uuid) from public, anon, authenticated;

revoke all on function public.v3_register_lot_from_receipt(uuid, uuid) from public, anon, authenticated;
grant execute on function public.v3_register_lot_from_receipt(uuid, uuid) to service_role;
grant execute on function public.v3_register_lot_from_receipt(uuid, uuid) to postgres;

revoke all on function public.v3_consume_inventory(uuid, uuid, numeric, jsonb) from public, anon, authenticated;
grant execute on function public.v3_consume_inventory(uuid, uuid, numeric, jsonb) to authenticated;

revoke all on function public.v3_register_waste(uuid, uuid, numeric, text) from public, anon, authenticated;
grant execute on function public.v3_register_waste(uuid, uuid, numeric, text) to authenticated;

revoke all on function public.v3_register_adjustment(uuid, uuid, numeric, text) from public, anon, authenticated;
grant execute on function public.v3_register_adjustment(uuid, uuid, numeric, text) to authenticated;

revoke all on function public.v3_get_inventory_snapshot(uuid) from public, anon, authenticated;
grant execute on function public.v3_get_inventory_snapshot(uuid) to authenticated;

revoke all on function public.v3_get_inventory_movements(uuid, uuid, integer, integer) from public, anon, authenticated;
grant execute on function public.v3_get_inventory_movements(uuid, uuid, integer, integer) to authenticated;
