-- 00075_v3_inventory_hook_into_procurement.sql
-- Sprint-06 · create FIFO inventory lots from Goods Receipt lines.
-- v3_apply_ocr_job already calls v3_receive_goods, so OCR inherits this hook.

create or replace function public.v3_receive_goods(
  p_hotel_id uuid,
  p_purchase_order_id uuid,
  p_lines jsonb,
  p_received_at timestamptz default now(),
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_receive$
declare
  v_order record;
  v_line_payload jsonb;
  v_order_line record;
  v_goods_receipt_id uuid;
  v_goods_receipt_line_id uuid;
  v_quality_status public.v3_gr_quality_status;
  v_quantity_received numeric(12,3);
  v_effective_quantity numeric(12,3);
  v_unit_price numeric(12,4);
  v_rejection_reason text;
  v_purchase_order_line_id uuid;
  v_lot_number text;
  v_expiry_date date;
  v_line_notes text;
  v_pending_quantity numeric(12,3);
  v_lines_count integer := 0;
  v_price_changes_logged integer := 0;
  v_all_complete boolean := false;
  v_new_po_status public.v3_po_status;
  v_constraint_name text;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array[
      'superadmin','direction','admin','head_chef','sous_chef','procurement','warehouse'
    ]::public.v3_app_role[]
  );

  if p_lines is null or jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 then
    raise exception 'p_lines must contain at least one line' using errcode = 'P0003';
  end if;

  select *
    into v_order
  from public.v3_purchase_orders
  where id = p_purchase_order_id
    and hotel_id = p_hotel_id
  for update;

  if v_order.id is null then
    raise exception 'purchase order not found' using errcode = 'P0010';
  end if;

  if v_order.status not in ('sent', 'received_partial') then
    raise exception 'purchase order must be sent or partially received'
      using errcode = 'P0012';
  end if;

  insert into public.v3_goods_receipts (
    hotel_id,
    purchase_order_id,
    supplier_id,
    received_at,
    received_by,
    notes
  )
  values (
    p_hotel_id,
    p_purchase_order_id,
    v_order.supplier_id,
    coalesce(p_received_at, now()),
    auth.uid(),
    p_notes
  )
  returning id into v_goods_receipt_id;

  for v_line_payload in
    select value from jsonb_array_elements(p_lines)
  loop
    v_purchase_order_line_id := nullif(v_line_payload ->> 'purchase_order_line_id', '')::uuid;
    v_quantity_received := coalesce((v_line_payload ->> 'quantity_received')::numeric, 0);
    v_unit_price := (v_line_payload ->> 'unit_price')::numeric;
    v_quality_status := coalesce(
      nullif(v_line_payload ->> 'quality_status', ''),
      'accepted'
    )::public.v3_gr_quality_status;
    v_rejection_reason := nullif(btrim(coalesce(v_line_payload ->> 'rejection_reason', '')), '');
    v_lot_number := nullif(btrim(coalesce(v_line_payload ->> 'lot_number', '')), '');
    v_expiry_date := nullif(v_line_payload ->> 'expiry_date', '')::date;
    v_line_notes := nullif(btrim(coalesce(v_line_payload ->> 'notes', '')), '');

    if v_purchase_order_line_id is null then
      raise exception 'purchase_order_line_id is required' using errcode = 'P0003';
    end if;

    if v_quantity_received < 0 then
      raise exception 'quantity_received must be >= 0' using errcode = 'P0003';
    end if;

    if v_unit_price is null or v_unit_price < 0 then
      raise exception 'unit_price must be >= 0' using errcode = 'P0003';
    end if;

    if v_quality_status = 'rejected' and v_rejection_reason is null then
      raise exception 'rejection_reason is required for rejected lines'
        using errcode = 'P0003';
    end if;

    select *
      into v_order_line
    from public.v3_purchase_order_lines
    where id = v_purchase_order_line_id
      and hotel_id = p_hotel_id
      and purchase_order_id = p_purchase_order_id
    for update;

    if v_order_line.id is null then
      raise exception 'purchase order line not found for this order'
        using errcode = 'P0010';
    end if;

    v_pending_quantity := v_order_line.quantity_ordered - v_order_line.quantity_received;

    if v_quantity_received > v_pending_quantity then
      raise exception 'quantity_received exceeds pending quantity for purchase order line %', v_purchase_order_line_id
        using errcode = 'P0003';
    end if;

    v_effective_quantity := case
      when v_quality_status = 'rejected' then 0
      else v_quantity_received
    end;

    insert into public.v3_goods_receipt_lines (
      hotel_id,
      goods_receipt_id,
      purchase_order_line_id,
      product_id,
      quantity_received,
      unit_id,
      unit_price,
      quality_status,
      rejection_reason,
      lot_number,
      expiry_date,
      notes
    )
    values (
      p_hotel_id,
      v_goods_receipt_id,
      v_order_line.id,
      v_order_line.product_id,
      v_quantity_received,
      v_order_line.unit_id,
      v_unit_price,
      v_quality_status,
      v_rejection_reason,
      v_lot_number,
      v_expiry_date,
      v_line_notes
    )
    returning id into v_goods_receipt_line_id;

    perform public.v3_register_lot_from_receipt(p_hotel_id, v_goods_receipt_line_id);

    update public.v3_purchase_order_lines
    set quantity_received = quantity_received + v_effective_quantity,
        updated_at = now()
    where id = v_order_line.id
      and hotel_id = p_hotel_id;

    if v_effective_quantity > 0 and v_unit_price is distinct from v_order_line.last_unit_price then
      insert into public.v3_price_change_log (
        hotel_id,
        product_id,
        purchase_order_line_id,
        old_price,
        new_price,
        source,
        delta_pct
      )
      values (
        p_hotel_id,
        v_order_line.product_id,
        v_order_line.id,
        v_order_line.last_unit_price,
        v_unit_price,
        'goods_receipt',
        case
          when v_order_line.last_unit_price is not null and v_order_line.last_unit_price > 0
          then round(((v_unit_price - v_order_line.last_unit_price) / v_order_line.last_unit_price) * 100, 4)
          else null
        end
      );

      v_price_changes_logged := v_price_changes_logged + 1;
    end if;

    v_lines_count := v_lines_count + 1;
  end loop;

  select coalesce(bool_and(quantity_received >= quantity_ordered), false)
    into v_all_complete
  from public.v3_purchase_order_lines
  where hotel_id = p_hotel_id
    and purchase_order_id = p_purchase_order_id;

  v_new_po_status := case
    when v_all_complete then 'received_complete'::public.v3_po_status
    else 'received_partial'::public.v3_po_status
  end;

  if v_new_po_status <> v_order.status then
    if not public.v3_validate_po_transition(v_order.status, v_new_po_status) then
      raise exception 'invalid purchase order transition: % -> %', v_order.status, v_new_po_status
        using errcode = 'P0012';
    end if;

    update public.v3_purchase_orders
    set status = v_new_po_status,
        updated_at = now()
    where id = p_purchase_order_id
      and hotel_id = p_hotel_id;

    perform public.v3_emit_event(
      p_hotel_id,
      'purchase_order',
      p_purchase_order_id,
      'purchase_order.' || v_new_po_status::text,
      jsonb_build_object(
        'goods_receipt_id', v_goods_receipt_id,
        'from', v_order.status,
        'to', v_new_po_status
      )
    );
  end if;

  perform public.v3_emit_event(
    p_hotel_id,
    'goods_receipt',
    v_goods_receipt_id,
    'goods_receipt.created',
    jsonb_build_object(
      'purchase_order_id', p_purchase_order_id,
      'supplier_id', v_order.supplier_id,
      'lines_count', v_lines_count,
      'price_changes_logged', v_price_changes_logged
    )
  );

  return jsonb_build_object(
    'goods_receipt_id', v_goods_receipt_id,
    'lines_count', v_lines_count,
    'new_po_status', v_new_po_status,
    'price_changes_logged', v_price_changes_logged
  );
exception
  when unique_violation then
    get stacked diagnostics v_constraint_name = constraint_name;
    if v_constraint_name = 'v3_goods_receipts_hotel_hash_uidx' then
      raise exception 'DUPLICATE_DELIVERY_NOTE' using errcode = 'P0016';
    end if;
    raise;
end;
$fn_v3_receive$;

revoke all on function public.v3_receive_goods(uuid, uuid, jsonb, timestamptz, text) from public;
grant execute on function public.v3_receive_goods(uuid, uuid, jsonb, timestamptz, text) to authenticated;
