-- 00084_v3_compliance_permissions_fix.sql
-- Sprint hardening-2 — corrige permisos compliance desalineados con
-- `.ai/specs/permissions-matrix.md` (hallazgo C1 auditoría 2026-04-28).
--
-- Cambios:
--   1) v3_record_goods_receipt_quality_check: quitar `procurement` del array
--      (matriz "Registrar APPCC" niega procurement explícitamente).
--   2) v3_trace_lot: cambiar `null` (cualquier miembro) por whitelist 6 roles
--      (matriz "Trace lot" ✅ superadmin/direction/admin/head_chef + ⚠️ sous_chef/warehouse).
--
-- v3_log_equipment_temperature, v3_complete_cleaning_check y
-- v3_get_compliance_overview ya están alineados — no se tocan.
--
-- Sin cambios de firma. Sin breaking changes para clientes autorizados.
-- Esperado post-fix: P0001 al ejecutar las RPCs con roles fuera de matriz.

begin;

-- =====================================================================
-- 1) v3_record_goods_receipt_quality_check — quitar procurement
-- =====================================================================
create or replace function public.v3_record_goods_receipt_quality_check(
  p_hotel_id uuid,
  p_goods_receipt_id uuid,
  p_temperature_c numeric default null,
  p_temperature_ok boolean default null,
  p_packaging_ok boolean default null,
  p_expiry_ok boolean default null,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_record_goods_receipt_quality_check$
declare
  v_goods_receipt_id uuid;
  v_check public.v3_compliance_quality_checks%rowtype;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef','sous_chef','cook','warehouse']::public.v3_app_role[]
  );

  select id
    into v_goods_receipt_id
  from public.v3_goods_receipts
  where hotel_id = p_hotel_id
    and id = p_goods_receipt_id;

  if v_goods_receipt_id is null then
    raise exception 'goods receipt not found' using errcode = 'P0010';
  end if;

  insert into public.v3_compliance_quality_checks (
    hotel_id,
    goods_receipt_id,
    temperature_c,
    temperature_ok,
    packaging_ok,
    expiry_ok,
    notes,
    checked_by,
    checked_at
  )
  values (
    p_hotel_id,
    p_goods_receipt_id,
    p_temperature_c,
    coalesce(p_temperature_ok, true),
    coalesce(p_packaging_ok, true),
    coalesce(p_expiry_ok, true),
    nullif(btrim(coalesce(p_notes, '')), ''),
    auth.uid(),
    now()
  )
  on conflict (hotel_id, goods_receipt_id)
  do update set
    temperature_c = excluded.temperature_c,
    temperature_ok = excluded.temperature_ok,
    packaging_ok = excluded.packaging_ok,
    expiry_ok = excluded.expiry_ok,
    notes = excluded.notes,
    checked_by = excluded.checked_by,
    checked_at = excluded.checked_at,
    updated_at = now()
  returning * into v_check;

  perform public.v3_emit_event(
    p_hotel_id,
    'goods_receipt',
    p_goods_receipt_id,
    'compliance.quality_checked',
    jsonb_build_object(
      'quality_check_id', v_check.id,
      'all_ok', v_check.all_ok,
      'temperature_ok', v_check.temperature_ok,
      'packaging_ok', v_check.packaging_ok,
      'expiry_ok', v_check.expiry_ok
    )
  );

  return to_jsonb(v_check);
end;
$fn_v3_record_goods_receipt_quality_check$;

-- =====================================================================
-- 2) v3_trace_lot — whitelist 6 roles (matriz "Trace lot")
-- =====================================================================
create or replace function public.v3_trace_lot(
  p_hotel_id uuid,
  p_lot_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_trace_lot$
declare
  v_lot record;
  v_goods_receipt jsonb := null;
  v_purchase_order jsonb := null;
  v_supplier jsonb := null;
  v_production jsonb := null;
  v_movements jsonb := '[]'::jsonb;
  v_consumed_in_recipes jsonb := '[]'::jsonb;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef','sous_chef','warehouse']::public.v3_app_role[]
  );

  select
    lot.*,
    p.name as product_name,
    p.category_id,
    u.name as unit_name,
    u.abbreviation as unit_abbreviation
    into v_lot
  from public.v3_inventory_lots lot
  join public.v3_products p
    on p.id = lot.product_id
   and p.hotel_id = p_hotel_id
  join public.v3_units_of_measure u
    on u.id = lot.unit_id
   and u.hotel_id = p_hotel_id
  where lot.hotel_id = p_hotel_id
    and lot.id = p_lot_id;

  if v_lot.id is null then
    raise exception 'inventory lot not found' using errcode = 'P0010';
  end if;

  if v_lot.goods_receipt_line_id is not null then
    select to_jsonb(gr) || jsonb_build_object(
      'line', to_jsonb(grl),
      'quality_check', to_jsonb(qc)
    )
      into v_goods_receipt
    from public.v3_goods_receipt_lines grl
    join public.v3_goods_receipts gr
      on gr.id = grl.goods_receipt_id
     and gr.hotel_id = p_hotel_id
    left join public.v3_compliance_quality_checks qc
      on qc.hotel_id = p_hotel_id
     and qc.goods_receipt_id = gr.id
    where grl.hotel_id = p_hotel_id
      and grl.id = v_lot.goods_receipt_line_id;

    select to_jsonb(po) || jsonb_build_object('line', to_jsonb(pol))
      into v_purchase_order
    from public.v3_goods_receipt_lines grl
    join public.v3_purchase_order_lines pol
      on pol.id = grl.purchase_order_line_id
     and pol.hotel_id = p_hotel_id
    join public.v3_purchase_orders po
      on po.id = pol.purchase_order_id
     and po.hotel_id = p_hotel_id
    where grl.hotel_id = p_hotel_id
      and grl.id = v_lot.goods_receipt_line_id;

    select to_jsonb(s)
      into v_supplier
    from public.v3_goods_receipt_lines grl
    join public.v3_purchase_order_lines pol
      on pol.id = grl.purchase_order_line_id
     and pol.hotel_id = p_hotel_id
    join public.v3_purchase_orders po
      on po.id = pol.purchase_order_id
     and po.hotel_id = p_hotel_id
    join public.v3_suppliers s
      on s.id = po.supplier_id
     and s.hotel_id = p_hotel_id
    where grl.hotel_id = p_hotel_id
      and grl.id = v_lot.goods_receipt_line_id;
  end if;

  if v_lot.production_order_id is not null then
    select to_jsonb(po) || jsonb_build_object('recipe_name', r.name)
      into v_production
    from public.v3_production_orders po
    join public.v3_recipes r
      on r.id = po.recipe_id
     and r.hotel_id = p_hotel_id
    where po.hotel_id = p_hotel_id
      and po.id = v_lot.production_order_id;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', m.id,
    'kind', m.kind,
    'quantity', m.quantity,
    'unit_cost', m.unit_cost,
    'total_cost', m.total_cost,
    'origin', m.origin,
    'notes', m.notes,
    'created_at', m.created_at
  ) order by m.created_at asc, m.id asc), '[]'::jsonb)
    into v_movements
  from public.v3_inventory_movements m
  where m.hotel_id = p_hotel_id
    and m.lot_id = p_lot_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'recipe_id', r.id,
    'recipe_name', r.name,
    'production_order_id', po.id,
    'movement_id', m.id,
    'quantity', m.quantity,
    'total_cost', m.total_cost,
    'consumed_at', m.created_at
  ) order by m.created_at asc, m.id asc), '[]'::jsonb)
    into v_consumed_in_recipes
  from public.v3_inventory_movements m
  left join public.v3_production_orders po
    on po.hotel_id = p_hotel_id
   and po.id::text = m.origin ->> 'production_order_id'
  left join public.v3_recipes r
    on r.hotel_id = p_hotel_id
   and r.id = coalesce(m.recipe_id, po.recipe_id)
  where m.hotel_id = p_hotel_id
    and m.lot_id = p_lot_id
    and m.kind = 'consume'
    and r.id is not null;

  perform public.v3_emit_event(
    p_hotel_id,
    'lot',
    p_lot_id,
    'lot.traced',
    jsonb_build_object('product_id', v_lot.product_id),
    0
  );

  return jsonb_build_object(
    'lot', jsonb_build_object(
      'id', v_lot.id,
      'hotel_id', v_lot.hotel_id,
      'product_id', v_lot.product_id,
      'product_name', v_lot.product_name,
      'category_id', v_lot.category_id,
      'quantity_received', v_lot.quantity_received,
      'quantity_remaining', v_lot.quantity_remaining,
      'unit_id', v_lot.unit_id,
      'unit_name', v_lot.unit_name,
      'unit_abbreviation', v_lot.unit_abbreviation,
      'unit_cost', v_lot.unit_cost,
      'received_at', v_lot.received_at,
      'expires_at', v_lot.expires_at,
      'is_preparation', coalesce(v_lot.is_preparation, false),
      'production_order_id', v_lot.production_order_id,
      'goods_receipt_line_id', v_lot.goods_receipt_line_id
    ),
    'goods_receipt', v_goods_receipt,
    'purchase_order', v_purchase_order,
    'supplier', v_supplier,
    'production', v_production,
    'movements', coalesce(v_movements, '[]'::jsonb),
    'consumed_in_recipes', coalesce(v_consumed_in_recipes, '[]'::jsonb)
  );
end;
$fn_v3_trace_lot$;

-- Re-aplicar grants (create or replace los preserva, pero por defensa)
revoke all on function public.v3_record_goods_receipt_quality_check(uuid, uuid, numeric, boolean, boolean, boolean, text) from public, anon, authenticated;
grant execute on function public.v3_record_goods_receipt_quality_check(uuid, uuid, numeric, boolean, boolean, boolean, text) to authenticated;

revoke all on function public.v3_trace_lot(uuid, uuid) from public, anon, authenticated;
grant execute on function public.v3_trace_lot(uuid, uuid) to authenticated;

commit;
