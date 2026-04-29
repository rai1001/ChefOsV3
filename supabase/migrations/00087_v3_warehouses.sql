-- 00087_v3_warehouses.sql
-- Sprint-11 · multi-warehouse sobre hotel_id.
-- ADR-0015: all v3-owned DB objects are prefixed with v3_.

create table if not exists public.v3_warehouses (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  name text not null,
  warehouse_type text not null check (warehouse_type in (
    'main', 'cold', 'frozen', 'dry', 'catering', 'production_kitchen', 'other'
  )),
  is_default boolean not null default false,
  is_active boolean not null default true,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint v3_warehouses_name_check check (nullif(btrim(name), '') is not null),
  constraint v3_warehouses_name_unique unique (hotel_id, name)
);

create unique index if not exists v3_warehouses_one_default_per_hotel
  on public.v3_warehouses(hotel_id)
  where is_default = true;

create unique index if not exists v3_warehouses_hotel_id_id_key
  on public.v3_warehouses(hotel_id, id);

create index if not exists v3_warehouses_hotel_active_idx
  on public.v3_warehouses(hotel_id, is_active, name);

alter table public.v3_warehouses enable row level security;

drop policy if exists v3_warehouses_select_members on public.v3_warehouses;
create policy v3_warehouses_select_members on public.v3_warehouses
  for select using (public.v3_is_member_of(hotel_id));

drop policy if exists v3_warehouses_insert_rpc_only on public.v3_warehouses;
create policy v3_warehouses_insert_rpc_only on public.v3_warehouses
  for insert with check (false);

drop policy if exists v3_warehouses_update_rpc_only on public.v3_warehouses;
create policy v3_warehouses_update_rpc_only on public.v3_warehouses
  for update using (false) with check (false);

drop policy if exists v3_warehouses_delete_never on public.v3_warehouses;
create policy v3_warehouses_delete_never on public.v3_warehouses
  for delete using (false);

drop trigger if exists v3_warehouses_set_updated_at on public.v3_warehouses;
create trigger v3_warehouses_set_updated_at
  before update on public.v3_warehouses
  for each row
  execute function public.v3_tg_set_updated_at();

alter table public.v3_inventory_lots
  add column if not exists warehouse_id uuid null;

alter table public.v3_inventory_movements
  add column if not exists warehouse_id uuid null;

alter table public.v3_compliance_equipment
  add column if not exists warehouse_id uuid null;

do $constraints_v3_warehouses$
begin
  if not exists (select 1 from pg_constraint where conname = 'v3_inventory_lots_warehouse_hotel_fkey') then
    alter table public.v3_inventory_lots
      add constraint v3_inventory_lots_warehouse_hotel_fkey
      foreign key (hotel_id, warehouse_id)
      references public.v3_warehouses(hotel_id, id)
      on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_inventory_movements_warehouse_hotel_fkey') then
    alter table public.v3_inventory_movements
      add constraint v3_inventory_movements_warehouse_hotel_fkey
      foreign key (hotel_id, warehouse_id)
      references public.v3_warehouses(hotel_id, id)
      on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_compliance_equipment_warehouse_hotel_fkey') then
    alter table public.v3_compliance_equipment
      add constraint v3_compliance_equipment_warehouse_hotel_fkey
      foreign key (hotel_id, warehouse_id)
      references public.v3_warehouses(hotel_id, id)
      on delete restrict;
  end if;
end $constraints_v3_warehouses$;

create index if not exists v3_inventory_lots_warehouse_idx
  on public.v3_inventory_lots(hotel_id, warehouse_id, product_id)
  where quantity_remaining > 0;

create index if not exists v3_inventory_movements_warehouse_idx
  on public.v3_inventory_movements(hotel_id, warehouse_id, created_at desc);

create index if not exists v3_compliance_equipment_warehouse_idx
  on public.v3_compliance_equipment(hotel_id, warehouse_id, is_active);

do $backfill_v3_warehouses$
declare
  v_hotel record;
  v_warehouse_id uuid;
begin
  for v_hotel in select id from public.v3_hotels loop
    select id
      into v_warehouse_id
    from public.v3_warehouses
    where hotel_id = v_hotel.id
      and is_default = true
    limit 1;

    if v_warehouse_id is null then
      select id
        into v_warehouse_id
      from public.v3_warehouses
      where hotel_id = v_hotel.id
        and name = 'Almacén principal'
      limit 1;

      if v_warehouse_id is null then
        insert into public.v3_warehouses (hotel_id, name, warehouse_type, is_default)
        values (v_hotel.id, 'Almacén principal', 'main', true)
        returning id into v_warehouse_id;
      else
        update public.v3_warehouses
        set is_default = true,
            warehouse_type = 'main',
            is_active = true,
            updated_at = now()
        where id = v_warehouse_id
          and hotel_id = v_hotel.id;
      end if;
    end if;

    update public.v3_inventory_lots
    set warehouse_id = v_warehouse_id,
        updated_at = now()
    where hotel_id = v_hotel.id
      and warehouse_id is null;

    update public.v3_inventory_movements
    set warehouse_id = v_warehouse_id
    where hotel_id = v_hotel.id
      and warehouse_id is null;

    update public.v3_compliance_equipment
    set warehouse_id = v_warehouse_id,
        updated_at = now()
    where hotel_id = v_hotel.id
      and warehouse_id is null;
  end loop;
end;
$backfill_v3_warehouses$;

create or replace function public.v3_resolve_warehouse_id(
  p_hotel_id uuid,
  p_warehouse_id uuid default null,
  p_require_active boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = public
as $fn_v3_resolve_warehouse_id$
declare
  v_warehouse record;
  v_default_id uuid;
begin
  if p_hotel_id is null then
    raise exception 'hotel_id is required' using errcode = 'P0003';
  end if;

  if p_warehouse_id is not null then
    select id, is_active
      into v_warehouse
    from public.v3_warehouses
    where hotel_id = p_hotel_id
      and id = p_warehouse_id;

    if v_warehouse.id is null then
      raise exception 'warehouse not found' using errcode = 'P0010';
    end if;

    if p_require_active and not v_warehouse.is_active then
      raise exception 'warehouse is archived' using errcode = 'P0010';
    end if;

    return v_warehouse.id;
  end if;

  select id
    into v_default_id
  from public.v3_warehouses
  where hotel_id = p_hotel_id
    and is_default = true
  limit 1;

  if v_default_id is not null then
    return v_default_id;
  end if;

  begin
    insert into public.v3_warehouses (hotel_id, name, warehouse_type, is_default)
    values (p_hotel_id, 'Almacén principal', 'main', true)
    returning id into v_default_id;
  exception
    when unique_violation then
      select id
        into v_default_id
      from public.v3_warehouses
      where hotel_id = p_hotel_id
        and is_default = true
      limit 1;
  end;

  if v_default_id is null then
    raise exception 'default warehouse required' using errcode = 'P0018';
  end if;

  return v_default_id;
end;
$fn_v3_resolve_warehouse_id$;

create or replace function public.v3_create_warehouse(
  p_hotel_id uuid,
  p_name text,
  p_warehouse_type text,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_create_warehouse$
declare
  v_name text := nullif(btrim(coalesce(p_name, '')), '');
  v_notes text := nullif(btrim(coalesce(p_notes, '')), '');
  v_row public.v3_warehouses%rowtype;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef','warehouse']::public.v3_app_role[]
  );

  if v_name is null or length(v_name) < 2 then
    raise exception 'warehouse name must contain at least 2 characters' using errcode = 'P0003';
  end if;

  if p_warehouse_type not in ('main', 'cold', 'frozen', 'dry', 'catering', 'production_kitchen', 'other') then
    raise exception 'invalid warehouse_type: %', p_warehouse_type using errcode = 'P0003';
  end if;

  insert into public.v3_warehouses (
    hotel_id,
    name,
    warehouse_type,
    notes
  )
  values (
    p_hotel_id,
    v_name,
    p_warehouse_type,
    v_notes
  )
  returning * into v_row;

  return to_jsonb(v_row) || jsonb_build_object('warehouse_id', v_row.id);
end;
$fn_v3_create_warehouse$;

create or replace function public.v3_update_warehouse(
  p_hotel_id uuid,
  p_warehouse_id uuid,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_update_warehouse$
declare
  v_current public.v3_warehouses%rowtype;
  v_name text;
  v_type text;
  v_notes text;
  v_row public.v3_warehouses%rowtype;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef','warehouse']::public.v3_app_role[]
  );

  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'payload must be a JSON object' using errcode = 'P0003';
  end if;

  if p_payload ? 'is_default' then
    raise exception 'use v3_set_default_warehouse to change default warehouse'
      using errcode = 'P0003';
  end if;

  if p_payload ? 'is_active' then
    raise exception 'use v3_archive_warehouse to change warehouse active status'
      using errcode = 'P0003';
  end if;

  select *
    into v_current
  from public.v3_warehouses
  where id = p_warehouse_id
    and hotel_id = p_hotel_id
  for update;

  if v_current.id is null then
    raise exception 'warehouse not found' using errcode = 'P0010';
  end if;

  v_name := case
    when p_payload ? 'name' then nullif(btrim(coalesce(p_payload ->> 'name', '')), '')
    else v_current.name
  end;
  v_type := coalesce(nullif(p_payload ->> 'warehouse_type', ''), v_current.warehouse_type);
  v_notes := case
    when p_payload ? 'notes' then nullif(btrim(coalesce(p_payload ->> 'notes', '')), '')
    else v_current.notes
  end;
  if v_name is null or length(v_name) < 2 then
    raise exception 'warehouse name must contain at least 2 characters' using errcode = 'P0003';
  end if;

  if v_type not in ('main', 'cold', 'frozen', 'dry', 'catering', 'production_kitchen', 'other') then
    raise exception 'invalid warehouse_type: %', v_type using errcode = 'P0003';
  end if;

  update public.v3_warehouses
  set name = v_name,
      warehouse_type = v_type,
      notes = v_notes,
      updated_at = now()
  where id = p_warehouse_id
    and hotel_id = p_hotel_id
  returning * into v_row;

  return to_jsonb(v_row) || jsonb_build_object('warehouse_id', v_row.id);
end;
$fn_v3_update_warehouse$;

create or replace function public.v3_set_default_warehouse(
  p_hotel_id uuid,
  p_warehouse_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_set_default_warehouse$
declare
  v_row public.v3_warehouses%rowtype;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin']::public.v3_app_role[]
  );

  perform public.v3_resolve_warehouse_id(p_hotel_id, p_warehouse_id, true);

  update public.v3_warehouses
  set is_default = false,
      updated_at = now()
  where hotel_id = p_hotel_id
    and is_default = true
    and id <> p_warehouse_id;

  update public.v3_warehouses
  set is_default = true,
      is_active = true,
      updated_at = now()
  where hotel_id = p_hotel_id
    and id = p_warehouse_id
  returning * into v_row;

  return to_jsonb(v_row) || jsonb_build_object('warehouse_id', v_row.id);
end;
$fn_v3_set_default_warehouse$;

create or replace function public.v3_archive_warehouse(
  p_hotel_id uuid,
  p_warehouse_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_archive_warehouse$
declare
  v_current public.v3_warehouses%rowtype;
  v_active_stock numeric(14,4);
  v_row public.v3_warehouses%rowtype;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin']::public.v3_app_role[]
  );

  select *
    into v_current
  from public.v3_warehouses
  where hotel_id = p_hotel_id
    and id = p_warehouse_id
  for update;

  if v_current.id is null then
    raise exception 'warehouse not found' using errcode = 'P0010';
  end if;

  if v_current.is_default then
    raise exception 'default warehouse cannot be archived' using errcode = 'P0018';
  end if;

  select coalesce(sum(quantity_remaining), 0)::numeric(14,4)
    into v_active_stock
  from public.v3_inventory_lots
  where hotel_id = p_hotel_id
    and warehouse_id = p_warehouse_id
    and quantity_remaining > 0;

  if v_active_stock > 0 then
    raise exception 'warehouse has active inventory' using errcode = 'P0011';
  end if;

  update public.v3_warehouses
  set is_active = false,
      updated_at = now()
  where hotel_id = p_hotel_id
    and id = p_warehouse_id
  returning * into v_row;

  return to_jsonb(v_row) || jsonb_build_object('warehouse_id', v_row.id);
end;
$fn_v3_archive_warehouse$;

create or replace function public.v3_transfer_lot_quantity(
  p_hotel_id uuid,
  p_lot_id uuid,
  p_to_warehouse_id uuid,
  p_quantity numeric,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_transfer_lot_quantity$
declare
  v_lot public.v3_inventory_lots%rowtype;
  v_from_warehouse_id uuid;
  v_to_warehouse_id uuid;
  v_quantity numeric(14,4);
  v_notes text := nullif(btrim(coalesce(p_notes, '')), '');
  v_new_lot_id uuid;
  v_from_movement_id uuid;
  v_to_movement_id uuid;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef','sous_chef','warehouse']::public.v3_app_role[]
  );

  if p_quantity is null or p_quantity <= 0 then
    raise exception 'quantity must be > 0' using errcode = 'P0003';
  end if;

  v_to_warehouse_id := public.v3_resolve_warehouse_id(p_hotel_id, p_to_warehouse_id, true);
  v_quantity := p_quantity::numeric(14,4);

  select *
    into v_lot
  from public.v3_inventory_lots
  where hotel_id = p_hotel_id
    and id = p_lot_id
  for update;

  if v_lot.id is null then
    raise exception 'inventory lot not found' using errcode = 'P0010';
  end if;

  v_from_warehouse_id := coalesce(
    v_lot.warehouse_id,
    public.v3_resolve_warehouse_id(p_hotel_id, null, true)
  );

  if v_from_warehouse_id = v_to_warehouse_id then
    raise exception 'source and destination warehouse must differ' using errcode = 'P0003';
  end if;

  if v_quantity > v_lot.quantity_remaining then
    raise exception 'transfer quantity exceeds available stock' using errcode = 'P0002';
  end if;

  insert into public.v3_inventory_movements (
    hotel_id,
    product_id,
    warehouse_id,
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
    v_lot.product_id,
    v_from_warehouse_id,
    v_lot.id,
    'transfer_out',
    v_quantity,
    v_lot.unit_id,
    v_lot.unit_cost,
    jsonb_build_object(
      'source', 'warehouse_transfer',
      'from_warehouse_id', v_from_warehouse_id,
      'to_warehouse_id', v_to_warehouse_id,
      'lot_id', v_lot.id
    ),
    v_notes,
    auth.uid()
  )
  returning id into v_from_movement_id;

  if v_quantity = v_lot.quantity_remaining then
    update public.v3_inventory_lots
    set warehouse_id = v_to_warehouse_id,
        updated_at = now()
    where hotel_id = p_hotel_id
      and id = v_lot.id;

    v_new_lot_id := null;

    insert into public.v3_inventory_movements (
      hotel_id,
      product_id,
      warehouse_id,
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
      v_lot.product_id,
      v_to_warehouse_id,
      v_lot.id,
      'transfer_in',
      v_quantity,
      v_lot.unit_id,
      v_lot.unit_cost,
      jsonb_build_object(
        'source', 'warehouse_transfer',
        'from_warehouse_id', v_from_warehouse_id,
        'to_warehouse_id', v_to_warehouse_id,
        'lot_id', v_lot.id
      ),
      v_notes,
      auth.uid()
    )
    returning id into v_to_movement_id;
  else
    update public.v3_inventory_lots
    set quantity_remaining = quantity_remaining - v_quantity,
        updated_at = now()
    where hotel_id = p_hotel_id
      and id = v_lot.id;

    insert into public.v3_inventory_lots (
      hotel_id,
      product_id,
      warehouse_id,
      goods_receipt_line_id,
      quantity_received,
      quantity_remaining,
      unit_id,
      unit_cost,
      received_at,
      expires_at,
      notes,
      is_preparation,
      production_order_id
    )
    values (
      p_hotel_id,
      v_lot.product_id,
      v_to_warehouse_id,
      null,
      v_quantity,
      v_quantity,
      v_lot.unit_id,
      v_lot.unit_cost,
      v_lot.received_at,
      v_lot.expires_at,
      concat_ws(E'\n', v_lot.notes, 'Split transfer from lot ' || v_lot.id::text),
      v_lot.is_preparation,
      v_lot.production_order_id
    )
    returning id into v_new_lot_id;

    insert into public.v3_inventory_movements (
      hotel_id,
      product_id,
      warehouse_id,
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
      v_lot.product_id,
      v_to_warehouse_id,
      v_new_lot_id,
      'transfer_in',
      v_quantity,
      v_lot.unit_id,
      v_lot.unit_cost,
      jsonb_build_object(
        'source', 'warehouse_transfer',
        'from_warehouse_id', v_from_warehouse_id,
        'to_warehouse_id', v_to_warehouse_id,
        'source_lot_id', v_lot.id,
        'new_lot_id', v_new_lot_id
      ),
      v_notes,
      auth.uid()
    )
    returning id into v_to_movement_id;
  end if;

  return jsonb_build_object(
    'from_movement_id', v_from_movement_id,
    'to_movement_id', v_to_movement_id,
    'new_lot_id', v_new_lot_id
  );
end;
$fn_v3_transfer_lot_quantity$;

create or replace function public.v3_get_stock_by_warehouse(
  p_hotel_id uuid,
  p_product_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_get_stock_by_warehouse$
declare
  v_rows jsonb;
begin
  perform public.v3_check_membership(auth.uid(), p_hotel_id, null);

  select coalesce(jsonb_agg(jsonb_build_object(
    'warehouse_id', stock.warehouse_id,
    'warehouse_name', stock.warehouse_name,
    'product_id', stock.product_id,
    'product_name', stock.product_name,
    'unit_id', stock.unit_id,
    'unit_abbreviation', stock.unit_abbreviation,
    'quantity_remaining', stock.quantity_remaining,
    'unit_cost_avg', stock.unit_cost_avg
  ) order by stock.warehouse_name, stock.product_name), '[]'::jsonb)
    into v_rows
  from (
    select
      w.id as warehouse_id,
      w.name as warehouse_name,
      p.id as product_id,
      p.name as product_name,
      u.id as unit_id,
      u.abbreviation as unit_abbreviation,
      sum(l.quantity_remaining)::numeric(14,4) as quantity_remaining,
      round((sum(l.quantity_remaining * l.unit_cost) / nullif(sum(l.quantity_remaining), 0))::numeric, 4)::numeric(14,4) as unit_cost_avg
    from public.v3_inventory_lots l
    join public.v3_warehouses w
      on w.id = l.warehouse_id
     and w.hotel_id = p_hotel_id
    join public.v3_products p
      on p.id = l.product_id
     and p.hotel_id = p_hotel_id
    join public.v3_units_of_measure u
      on u.id = l.unit_id
     and u.hotel_id = p_hotel_id
    where l.hotel_id = p_hotel_id
      and l.quantity_remaining > 0
      and (p_product_id is null or l.product_id = p_product_id)
    group by w.id, w.name, p.id, p.name, u.id, u.abbreviation
  ) stock;

  return v_rows;
end;
$fn_v3_get_stock_by_warehouse$;

drop function if exists public.v3_decrement_inventory_fifo(
  uuid,
  uuid,
  numeric,
  public.v3_inventory_movement_kind,
  jsonb,
  text,
  uuid
);

create or replace function public.v3_decrement_inventory_fifo(
  p_hotel_id uuid,
  p_product_id uuid,
  p_quantity numeric,
  p_kind public.v3_inventory_movement_kind,
  p_origin jsonb default '{}'::jsonb,
  p_notes text default null,
  p_created_by uuid default null,
  p_warehouse_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_decrement_inventory_fifo_warehouse$
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

  if p_warehouse_id is not null then
    perform public.v3_resolve_warehouse_id(p_hotel_id, p_warehouse_id, true);
  end if;

  set local lock_timeout = '5s';
  v_remaining := p_quantity::numeric(14,4);

  for v_lot in
    select *
    from public.v3_inventory_lots
    where hotel_id = p_hotel_id
      and product_id = p_product_id
      and quantity_remaining > 0
      and (p_warehouse_id is null or warehouse_id = p_warehouse_id)
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
      warehouse_id,
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
      v_lot.warehouse_id,
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
$fn_v3_decrement_inventory_fifo_warehouse$;

drop function if exists public.v3_register_lot_from_receipt(uuid, uuid);

create or replace function public.v3_register_lot_from_receipt(
  p_hotel_id uuid,
  p_goods_receipt_line_id uuid,
  p_warehouse_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $fn_v3_register_lot_from_receipt_warehouse$
declare
  v_line record;
  v_existing_lot_id uuid;
  v_lot_id uuid;
  v_unit_id uuid;
  v_warehouse_id uuid;
begin
  v_warehouse_id := public.v3_resolve_warehouse_id(p_hotel_id, p_warehouse_id, true);

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
    warehouse_id,
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
    v_warehouse_id,
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
    warehouse_id,
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
    v_warehouse_id,
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
$fn_v3_register_lot_from_receipt_warehouse$;

drop function if exists public.v3_consume_inventory(uuid, uuid, numeric, jsonb);

create or replace function public.v3_consume_inventory(
  p_hotel_id uuid,
  p_product_id uuid,
  p_quantity numeric,
  p_origin jsonb,
  p_warehouse_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_consume_inventory_warehouse$
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
    auth.uid(),
    p_warehouse_id
  );
end;
$fn_v3_consume_inventory_warehouse$;

drop function if exists public.v3_register_waste(uuid, uuid, numeric, text);

create or replace function public.v3_register_waste(
  p_hotel_id uuid,
  p_product_id uuid,
  p_quantity numeric,
  p_reason text,
  p_warehouse_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_register_waste_warehouse$
declare
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
  v_product_id uuid;
  v_warehouse_id uuid;
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

  v_warehouse_id := public.v3_resolve_warehouse_id(p_hotel_id, p_warehouse_id, true);

  return public.v3_decrement_inventory_fifo(
    p_hotel_id,
    p_product_id,
    p_quantity,
    'waste',
    jsonb_build_object('source', 'manual_waste', 'reason', v_reason),
    v_reason,
    auth.uid(),
    v_warehouse_id
  );
end;
$fn_v3_register_waste_warehouse$;

drop function if exists public.v3_register_adjustment(uuid, uuid, numeric, text);

create or replace function public.v3_register_adjustment(
  p_hotel_id uuid,
  p_product_id uuid,
  p_quantity_delta numeric,
  p_reason text,
  p_warehouse_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_register_adjustment_warehouse$
declare
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
  v_product record;
  v_unit_id uuid;
  v_unit_cost numeric(14,4);
  v_lot_id uuid;
  v_abs_quantity numeric(14,4);
  v_result jsonb;
  v_warehouse_id uuid;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','warehouse']::public.v3_app_role[]
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

  v_warehouse_id := public.v3_resolve_warehouse_id(p_hotel_id, p_warehouse_id, true);

  if p_quantity_delta > 0 then
    select unit_id, unit_cost
      into v_unit_id, v_unit_cost
    from public.v3_inventory_lots
    where hotel_id = p_hotel_id
      and product_id = p_product_id
      and warehouse_id = v_warehouse_id
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
      warehouse_id,
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
      v_warehouse_id,
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
      warehouse_id,
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
      v_warehouse_id,
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
      'warehouse_id', v_warehouse_id,
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
    auth.uid(),
    v_warehouse_id
  );

  return v_result || jsonb_build_object(
    'warehouse_id', v_warehouse_id,
    'quantity_delta', p_quantity_delta,
    'movement_kind', 'adjust_out'
  );
end;
$fn_v3_register_adjustment_warehouse$;

drop function if exists public.v3_get_inventory_snapshot(uuid);

create or replace function public.v3_get_inventory_snapshot(
  p_hotel_id uuid,
  p_warehouse_id uuid default null
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
as $fn_v3_get_inventory_snapshot_warehouse$
declare
  v_warehouse_id uuid := null;
begin
  perform public.v3_check_membership(auth.uid(), p_hotel_id, null);

  if p_warehouse_id is not null then
    v_warehouse_id := public.v3_resolve_warehouse_id(p_hotel_id, p_warehouse_id, true);
  end if;

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
   and (v_warehouse_id is null or l.warehouse_id = v_warehouse_id)
  left join lateral (
    select lot.unit_cost
    from public.v3_inventory_lots lot
    where lot.hotel_id = p_hotel_id
      and lot.product_id = p.id
      and (v_warehouse_id is null or lot.warehouse_id = v_warehouse_id)
    order by lot.received_at desc, lot.id desc
    limit 1
  ) latest on true
  where p.hotel_id = p_hotel_id
    and p.is_active = true
  group by p.id, p.name, p.category_id, latest.unit_cost
  order by p.name asc;
end;
$fn_v3_get_inventory_snapshot_warehouse$;

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
as $fn_v3_receive_goods_warehouse$
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
  v_line_warehouse_id uuid;
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
      'superadmin','direction','admin','warehouse'
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
    v_line_warehouse_id := nullif(v_line_payload ->> 'warehouse_id', '')::uuid;
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

    perform public.v3_register_lot_from_receipt(
      p_hotel_id,
      v_goods_receipt_line_id,
      v_line_warehouse_id
    );

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
$fn_v3_receive_goods_warehouse$;

drop function if exists public.v3_compute_subrecipe_chain(uuid, uuid, numeric, integer);

create or replace function public.v3_compute_subrecipe_chain(
  p_hotel_id uuid,
  p_recipe_id uuid,
  p_target_servings numeric,
  p_depth integer default 0,
  p_warehouse_id uuid default null
)
returns table (
  depth integer,
  parent_recipe_id uuid,
  recipe_id uuid,
  product_id uuid,
  unit_id uuid,
  required numeric,
  available numeric,
  missing numeric,
  output_quantity_per_batch numeric,
  batches_needed numeric,
  target_servings numeric,
  quantity_to_produce numeric,
  will_produce boolean
)
language plpgsql
stable
security definer
set search_path = public
as $fn_v3_compute_subrecipe_chain_warehouse$
declare
  v_recipe record;
  v_child record;
  v_child_depth integer := coalesce(p_depth, 0) + 1;
  v_available numeric(14,4);
  v_missing numeric(14,4);
  v_batches numeric(14,4);
  v_target_servings numeric(14,4);
  v_quantity_to_produce numeric(14,4);
  v_warehouse_id uuid := null;
begin
  perform public.v3_check_membership(auth.uid(), p_hotel_id, null);

  if p_warehouse_id is not null then
    v_warehouse_id := public.v3_resolve_warehouse_id(p_hotel_id, p_warehouse_id, true);
  end if;

  if p_target_servings is null or p_target_servings <= 0 then
    raise exception 'target servings must be > 0' using errcode = 'P0003';
  end if;

  select r.id, r.servings::numeric as servings
    into v_recipe
  from public.v3_recipes r
  where r.id = p_recipe_id
    and r.hotel_id = p_hotel_id
    and r.status not in ('deprecated', 'archived');

  if v_recipe.id is null then
    raise exception 'recipe not found for subrecipe chain' using errcode = 'P0010';
  end if;

  if v_recipe.servings is null or v_recipe.servings <= 0 then
    raise exception 'recipe servings must be > 0 for subrecipe chain'
      using errcode = 'P0003';
  end if;

  for v_child in
    select
      ri.source_recipe_id as recipe_id,
      ri.product_id,
      ri.unit_id,
      round((coalesce(ri.quantity_net, ri.quantity_gross) * (p_target_servings / v_recipe.servings))::numeric, 4) as required,
      sr.servings::numeric as source_servings,
      sr.output_quantity_per_batch::numeric as output_quantity_per_batch
    from public.v3_recipe_ingredients ri
    join public.v3_recipes sr
      on sr.id = ri.source_recipe_id
     and sr.hotel_id = p_hotel_id
     and sr.is_preparation = true
     and sr.status not in ('deprecated', 'archived')
    where ri.hotel_id = p_hotel_id
      and ri.recipe_id = p_recipe_id
      and ri.source_recipe_id is not null
      and ri.product_id is not null
      and ri.unit_id is not null
      and coalesce(ri.quantity_net, ri.quantity_gross) > 0
    order by ri.sort_order, ri.id
  loop
    if v_child_depth > 5 then
      raise exception 'subrecipe cascade too deep for recipe %', p_recipe_id
        using errcode = 'P0017';
    end if;

    if v_child.source_servings is null or v_child.source_servings <= 0 then
      raise exception 'source recipe servings must be > 0'
        using errcode = 'P0003';
    end if;

    if v_child.output_quantity_per_batch is null or v_child.output_quantity_per_batch <= 0 then
      raise exception 'source recipe output_quantity_per_batch must be > 0'
        using errcode = 'P0003';
    end if;

    select coalesce(sum(lot.quantity_remaining), 0)::numeric(14,4)
      into v_available
    from public.v3_inventory_lots lot
    where lot.hotel_id = p_hotel_id
      and lot.product_id = v_child.product_id
      and lot.quantity_remaining > 0
      and (v_warehouse_id is null or lot.warehouse_id = v_warehouse_id);

    v_missing := greatest((v_child.required - v_available)::numeric, 0)::numeric(14,4);
    v_batches := case
      when v_missing > 0 then ceil(v_missing / v_child.output_quantity_per_batch)::numeric(14,4)
      else 0::numeric(14,4)
    end;
    v_target_servings := (v_child.source_servings * v_batches)::numeric(14,4);
    v_quantity_to_produce := (v_child.output_quantity_per_batch * v_batches)::numeric(14,4);

    depth := v_child_depth;
    parent_recipe_id := p_recipe_id;
    recipe_id := v_child.recipe_id;
    product_id := v_child.product_id;
    unit_id := v_child.unit_id;
    required := v_child.required::numeric(14,4);
    available := v_available;
    missing := v_missing;
    output_quantity_per_batch := v_child.output_quantity_per_batch::numeric(14,4);
    batches_needed := v_batches;
    target_servings := v_target_servings;
    quantity_to_produce := v_quantity_to_produce;
    will_produce := v_missing > 0;

    return next;

    if v_missing > 0 then
      return query
      select *
      from public.v3_compute_subrecipe_chain(
        p_hotel_id,
        v_child.recipe_id,
        v_target_servings,
        v_child_depth,
        v_warehouse_id
      );
    end if;
  end loop;
end;
$fn_v3_compute_subrecipe_chain_warehouse$;

drop function if exists public.v3_check_production_feasibility(uuid, uuid);

create or replace function public.v3_check_production_feasibility(
  p_hotel_id uuid,
  p_production_order_id uuid,
  p_warehouse_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_check_production_feasibility_warehouse$
declare
  v_order record;
  v_deficits jsonb;
  v_chain jsonb;
  v_warehouse_id uuid := null;
begin
  perform public.v3_check_membership(auth.uid(), p_hotel_id, null);

  if p_warehouse_id is not null then
    v_warehouse_id := public.v3_resolve_warehouse_id(p_hotel_id, p_warehouse_id, true);
  end if;

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
  from public.v3_compute_subrecipe_chain(
    p_hotel_id,
    v_order.recipe_id,
    v_order.servings,
    0,
    v_warehouse_id
  ) c;

  with chain as materialized (
    select *
    from public.v3_compute_subrecipe_chain(
      p_hotel_id,
      v_order.recipe_id,
      v_order.servings,
      0,
      v_warehouse_id
    )
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
      and (v_warehouse_id is null or lot.warehouse_id = v_warehouse_id)
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
    'subrecipe_chain', v_chain,
    'warehouse_id', v_warehouse_id
  );
end;
$fn_v3_check_production_feasibility_warehouse$;

drop function if exists public.v3_produce_subrecipe(uuid, uuid, numeric, jsonb);

create or replace function public.v3_produce_subrecipe(
  p_hotel_id uuid,
  p_recipe_id uuid,
  p_target_quantity numeric,
  p_origin jsonb default '{}'::jsonb,
  p_warehouse_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_produce_subrecipe_warehouse$
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
  v_output_warehouse_id uuid;
begin
  if p_target_quantity is null or p_target_quantity <= 0 then
    raise exception 'target quantity must be > 0' using errcode = 'P0003';
  end if;

  if p_origin is not null and jsonb_typeof(p_origin) <> 'object' then
    raise exception 'origin must be a JSON object' using errcode = 'P0003';
  end if;

  v_output_warehouse_id := public.v3_resolve_warehouse_id(p_hotel_id, p_warehouse_id, true);

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
      and (p_warehouse_id is null or lot.warehouse_id = p_warehouse_id)
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
      'warehouse_id', v_output_warehouse_id,
      'created_by', auth.uid()
    )
  );

  v_started := public.v3_start_production(p_hotel_id, v_sub_order_id, p_warehouse_id);
  v_actual_total_cost := coalesce((v_started #>> '{order,actual_total_cost}')::numeric, 0)::numeric(18,4);
  v_unit_cost := round(v_actual_total_cost / nullif(v_quantity_to_produce, 0), 4)::numeric(14,4);

  insert into public.v3_inventory_lots (
    hotel_id,
    product_id,
    warehouse_id,
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
    v_output_warehouse_id,
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
      'lot_id', v_lot_id,
      'warehouse_id', v_output_warehouse_id
    );

  insert into public.v3_inventory_movements (
    hotel_id,
    product_id,
    warehouse_id,
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
    v_output_warehouse_id,
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
    'warehouse_id', v_output_warehouse_id,
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
$fn_v3_produce_subrecipe_warehouse$;

drop function if exists public.v3_start_production(uuid, uuid);

create or replace function public.v3_start_production(
  p_hotel_id uuid,
  p_production_order_id uuid,
  p_warehouse_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_start_production_warehouse$
declare
  v_order record;
  v_line record;
  v_chain record;
  v_result jsonb;
  v_feasibility jsonb;
  v_actual_total_cost numeric(18,4) := 0;
  v_subrecipe_productions jsonb := '[]'::jsonb;
  v_warehouse_id uuid := null;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef','sous_chef','cook']::public.v3_app_role[]
  );

  if p_warehouse_id is not null then
    v_warehouse_id := public.v3_resolve_warehouse_id(p_hotel_id, p_warehouse_id, true);
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

  if v_order.status not in ('draft', 'scheduled') then
    raise exception 'production order cannot start from status %', v_order.status
      using errcode = 'P0003';
  end if;

  set local lock_timeout = '5s';

  v_feasibility := public.v3_check_production_feasibility(
    p_hotel_id,
    p_production_order_id,
    v_warehouse_id
  );

  if coalesce((v_feasibility ->> 'feasible')::boolean, false) = false then
    raise exception 'insufficient stock for production order %', p_production_order_id
      using errcode = 'P0002',
            detail = v_feasibility::text;
  end if;

  for v_chain in
    select *
    from public.v3_compute_subrecipe_chain(
      p_hotel_id,
      v_order.recipe_id,
      v_order.servings,
      0,
      v_warehouse_id
    ) chain
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
        'cascade_depth', v_chain.depth,
        'warehouse_id', v_warehouse_id
      ),
      v_warehouse_id
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
    and (v_warehouse_id is null or lot.warehouse_id = v_warehouse_id)
  order by lot.product_id, lot.received_at asc, lot.id asc
  for update;

  v_feasibility := public.v3_check_production_feasibility(
    p_hotel_id,
    p_production_order_id,
    v_warehouse_id
  );

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
        'source_recipe_id', v_line.source_recipe_id,
        'warehouse_id', v_warehouse_id
      ),
      v_warehouse_id
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
      'warehouse_id', v_warehouse_id,
      'started_by', auth.uid()
    )
  );

  return public.v3_get_production_order(p_hotel_id, p_production_order_id)
    || jsonb_build_object(
      'subrecipe_productions', v_subrecipe_productions,
      'warehouse_id', v_warehouse_id
    );
end;
$fn_v3_start_production_warehouse$;

revoke all on function public.v3_resolve_warehouse_id(uuid, uuid, boolean) from public, anon, authenticated;

revoke all on function public.v3_create_warehouse(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.v3_create_warehouse(uuid, text, text, text) to authenticated;

revoke all on function public.v3_update_warehouse(uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.v3_update_warehouse(uuid, uuid, jsonb) to authenticated;

revoke all on function public.v3_set_default_warehouse(uuid, uuid) from public, anon, authenticated;
grant execute on function public.v3_set_default_warehouse(uuid, uuid) to authenticated;

revoke all on function public.v3_archive_warehouse(uuid, uuid) from public, anon, authenticated;
grant execute on function public.v3_archive_warehouse(uuid, uuid) to authenticated;

revoke all on function public.v3_transfer_lot_quantity(uuid, uuid, uuid, numeric, text) from public, anon, authenticated;
grant execute on function public.v3_transfer_lot_quantity(uuid, uuid, uuid, numeric, text) to authenticated;

revoke all on function public.v3_get_stock_by_warehouse(uuid, uuid) from public, anon, authenticated;
grant execute on function public.v3_get_stock_by_warehouse(uuid, uuid) to authenticated;

revoke all on function public.v3_decrement_inventory_fifo(uuid, uuid, numeric, public.v3_inventory_movement_kind, jsonb, text, uuid, uuid) from public, anon, authenticated;

revoke all on function public.v3_register_lot_from_receipt(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.v3_register_lot_from_receipt(uuid, uuid, uuid) to service_role;
grant execute on function public.v3_register_lot_from_receipt(uuid, uuid, uuid) to postgres;

revoke all on function public.v3_consume_inventory(uuid, uuid, numeric, jsonb, uuid) from public, anon, authenticated;
grant execute on function public.v3_consume_inventory(uuid, uuid, numeric, jsonb, uuid) to authenticated;

revoke all on function public.v3_register_waste(uuid, uuid, numeric, text, uuid) from public, anon, authenticated;
grant execute on function public.v3_register_waste(uuid, uuid, numeric, text, uuid) to authenticated;

revoke all on function public.v3_register_adjustment(uuid, uuid, numeric, text, uuid) from public, anon, authenticated;
grant execute on function public.v3_register_adjustment(uuid, uuid, numeric, text, uuid) to authenticated;

revoke all on function public.v3_get_inventory_snapshot(uuid, uuid) from public, anon, authenticated;
grant execute on function public.v3_get_inventory_snapshot(uuid, uuid) to authenticated;

revoke all on function public.v3_receive_goods(uuid, uuid, jsonb, timestamptz, text) from public, anon, authenticated;
grant execute on function public.v3_receive_goods(uuid, uuid, jsonb, timestamptz, text) to authenticated;

revoke all on function public.v3_compute_subrecipe_chain(uuid, uuid, numeric, integer, uuid) from public, anon, authenticated;
grant execute on function public.v3_compute_subrecipe_chain(uuid, uuid, numeric, integer, uuid) to authenticated;

revoke all on function public.v3_check_production_feasibility(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.v3_check_production_feasibility(uuid, uuid, uuid) to authenticated;

revoke all on function public.v3_produce_subrecipe(uuid, uuid, numeric, jsonb, uuid) from public, anon, authenticated;
grant execute on function public.v3_produce_subrecipe(uuid, uuid, numeric, jsonb, uuid) to postgres, service_role;

revoke all on function public.v3_start_production(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.v3_start_production(uuid, uuid, uuid) to authenticated;
