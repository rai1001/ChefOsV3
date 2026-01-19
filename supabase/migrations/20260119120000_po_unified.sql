-- Unifica Purchase Orders con líneas y catálogo de supplier_items
do $$
begin
  if not exists (select 1 from pg_type where typname = 'purchase_order_received_state') then
    create type public.purchase_order_received_state as enum ('none','partial','full');
  end if;
end $$;

-- Supplier items catálogo por proveedor
create table if not exists public.supplier_items (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  purchase_unit text not null,
  pack_size numeric,
  rounding_rule text not null,
  price_per_unit numeric,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  is_primary boolean not null default false,
  lead_time_days_override integer,
  constraint supplier_items_purchase_unit_check check (purchase_unit in ('kg','ud')),
  constraint supplier_items_rounding_rule_check check (rounding_rule in ('ceil_pack','ceil_unit','none')),
  constraint supplier_items_lead_time_override_chk check (lead_time_days_override is null or lead_time_days_override >= 0),
  constraint supplier_items_pack_rounding_check check (
    (rounding_rule = 'ceil_pack' and pack_size is not null and pack_size > 0)
    or (rounding_rule <> 'ceil_pack')
  ),
  constraint supplier_items_primary_requires_product check ((is_primary = false) or (product_id is not null))
);

create unique index if not exists supplier_items_supplier_name_idx
  on public.supplier_items (supplier_id, name);

create unique index if not exists supplier_items_primary_product_uniq
  on public.supplier_items (product_id)
  where is_primary = true and product_id is not null;

-- Campos adicionales en purchase_orders (orden/estados/fechas)
alter table public.purchase_orders
  alter column supplier_id drop not null;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'purchase_orders' and column_name = 'order_number'
  ) then
    alter table public.purchase_orders
      add column order_number text,
      add column notes text,
      add column created_at timestamptz not null default timezone('utc', now()),
      add column confirmed_at timestamptz,
      add column received_at timestamptz,
      add column approval_status text not null default 'pending',
      add column approved_at timestamptz,
      add column ordered_at timestamptz,
      add column received_state public.purchase_order_received_state not null default 'none';
    -- popular order_number básico para filas existentes
    update public.purchase_orders
      set order_number = coalesce(order_number, 'PO-' || left(id::text, 8)),
          status = coalesce(status, 'draft'),
          total_estimated = coalesce(total_estimated, 0);
  end if;
end $$;

create unique index if not exists purchase_orders_org_order_number_uniq
  on public.purchase_orders (org_id, order_number);

-- Líneas de pedido
create table if not exists public.purchase_order_lines (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  purchase_order_id uuid not null references public.purchase_orders(id) on delete cascade,
  supplier_item_id uuid not null references public.supplier_items(id) on delete restrict,
  requested_qty numeric not null,
  received_qty numeric not null default 0,
  purchase_unit text not null,
  rounding_rule text not null,
  pack_size numeric,
  unit_price numeric,
  line_total numeric not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  constraint purchase_order_lines_purchase_unit_check check (purchase_unit in ('kg','ud')),
  constraint purchase_order_lines_requested_qty_check check (requested_qty >= 0),
  constraint purchase_order_lines_received_qty_check check (received_qty >= 0),
  constraint purchase_order_lines_rounding_rule_check check (rounding_rule in ('ceil_pack','ceil_unit','none'))
);

create unique index if not exists purchase_order_lines_po_supplier_item_uniq
  on public.purchase_order_lines (purchase_order_id, supplier_item_id);

-- Trigger helpers para totales
create or replace function public.update_line_total() returns trigger as $$
declare
  v_unit numeric := coalesce(new.unit_price, 0);
begin
  new.line_total := v_unit * coalesce(new.requested_qty, 0);
  return new;
end;
$$ language plpgsql;

create or replace function public.refresh_po_total() returns trigger as $$
declare
  v_po uuid;
begin
  if tg_op = 'DELETE' then
    v_po := old.purchase_order_id;
  else
    v_po := new.purchase_order_id;
  end if;

  update public.purchase_orders
    set total_estimated = coalesce((
      select sum(line_total) from public.purchase_order_lines where purchase_order_id = v_po
    ), 0)
  where id = v_po;

  return coalesce(new, old);
end;
$$ language plpgsql;

create trigger purchase_order_lines_total
before insert or update on public.purchase_order_lines
for each row execute function public.update_line_total();

create trigger purchase_order_lines_total_refresh
after insert or update or delete on public.purchase_order_lines
for each row execute function public.refresh_po_total();

-- RLS
alter table public.supplier_items enable row level security;
alter table public.purchase_order_lines enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='supplier_items' and policyname='Supplier items select by membership'
  ) then
    execute 'create policy "Supplier items select by membership" on public.supplier_items for select using (is_org_member(org_id))';
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='supplier_items' and policyname='Supplier items insert by membership'
  ) then
    execute 'create policy "Supplier items insert by membership" on public.supplier_items for insert with check (is_org_member(org_id))';
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='supplier_items' and policyname='Supplier items update by membership'
  ) then
    execute 'create policy "Supplier items update by membership" on public.supplier_items for update using (is_org_member(org_id)) with check (is_org_member(org_id))';
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='supplier_items' and policyname='Supplier items delete by membership'
  ) then
    execute 'create policy "Supplier items delete by membership" on public.supplier_items for delete using (is_org_member(org_id))';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='purchase_order_lines' and policyname='PO lines select by membership'
  ) then
    execute 'create policy "PO lines select by membership" on public.purchase_order_lines for select using (is_org_member(org_id))';
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='purchase_order_lines' and policyname='PO lines insert by membership'
  ) then
    execute 'create policy "PO lines insert by membership" on public.purchase_order_lines for insert with check (is_org_member(org_id))';
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='purchase_order_lines' and policyname='PO lines update by membership'
  ) then
    execute 'create policy "PO lines update by membership" on public.purchase_order_lines for update using (is_org_member(org_id)) with check (is_org_member(org_id))';
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='purchase_order_lines' and policyname='PO lines delete by membership'
  ) then
    execute 'create policy "PO lines delete by membership" on public.purchase_order_lines for delete using (is_org_member(org_id))';
  end if;
end $$;

-- Función simple de recepción (actualiza cantidades y estado)
create or replace function public.receive_purchase_order(p_order_id uuid, p_lines jsonb)
returns void
language plpgsql
as $$
declare
  v_po_org uuid;
  v_po_hotel uuid;
  v_line jsonb;
  v_line_id uuid;
  v_rcvd numeric;
  v_pending int;
  v_location uuid;
  v_batch uuid;
  v_unit text;
begin
  select org_id, hotel_id into v_po_org, v_po_hotel from public.purchase_orders where id = p_order_id;
  if not found then
    raise exception 'purchase order % not found', p_order_id;
  end if;

  -- Location fallback: primer inventory_locations de la org (si existe)
  select id into v_location
  from public.inventory_locations
  where org_id = v_po_org
  order by created_at
  limit 1;

  for v_line in select * from jsonb_array_elements(p_lines)
  loop
    v_line_id := (v_line->>'line_id')::uuid;
    v_rcvd := coalesce((v_line->>'received_qty')::numeric, 0);
    select purchase_unit into v_unit from public.purchase_order_lines where id = v_line_id;
    update public.purchase_order_lines
      set received_qty = greatest(0, coalesce(received_qty, 0) + v_rcvd)
      where id = v_line_id
        and purchase_order_id = p_order_id;

    -- Crear batch y movimiento si hay qty recibida
    if v_rcvd > 0 then
      select gen_random_uuid() into v_batch;
      insert into public.stock_batches (
        id, org_id, hotel_id, location_id, supplier_item_id, source, qty, unit
      )
      select
        v_batch,
        pol.org_id,
        v_po_hotel,
        v_location,
        pol.supplier_item_id,
        'purchase',
        v_rcvd,
        v_unit
      from public.purchase_order_lines pol
      where pol.id = v_line_id;

      insert into public.stock_movements (
        org_id, hotel_id, location_id, supplier_item_id, batch_id, reason, qty, unit
      )
      select
        pol.org_id,
        v_po_hotel,
        v_location,
        pol.supplier_item_id,
        v_batch,
        'receive',
        v_rcvd,
        v_unit
      from public.purchase_order_lines pol
      where pol.id = v_line_id;

      -- Upsert stock_levels
      insert into public.stock_levels (org_id, hotel_id, location_id, supplier_item_id, on_hand_qty, unit)
      select
        pol.org_id,
        v_po_hotel,
        v_location,
        pol.supplier_item_id,
        v_rcvd,
        v_unit
      from public.purchase_order_lines pol
      where pol.id = v_line_id
      on conflict (location_id, supplier_item_id) do update
        set on_hand_qty = public.stock_levels.on_hand_qty + excluded.on_hand_qty;
    end if;
  end loop;

  -- Recalcular estado recibido
  v_pending := (
    select count(*) from public.purchase_order_lines
    where purchase_order_id = p_order_id
      and received_qty < requested_qty
  );

  update public.purchase_orders
    set status = case when v_pending = 0 then 'received' else 'ordered' end,
        received_state = case
          when (select count(*) from public.purchase_order_lines where purchase_order_id = p_order_id) = 0 then 'none'
          when v_pending = 0 then 'full'
          else 'partial'
        end,
        received_at = case when v_pending = 0 then timezone('utc', now()) else received_at end
  where id = p_order_id;
end;
$$;
