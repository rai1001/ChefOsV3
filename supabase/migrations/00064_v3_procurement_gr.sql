-- 00064_v3_procurement_gr.sql
-- Sprint-05b · procurement Goods Receipts schema.
-- ADR-0015: all v3-owned DB objects are prefixed with v3_.

-- ═══════════════════════════════════════════════════════════════════════════════
-- Enum
-- ═══════════════════════════════════════════════════════════════════════════════

do $enum_gr$
begin
  if not exists (select 1 from pg_type where typname = 'v3_gr_quality_status') then
    create type public.v3_gr_quality_status as enum ('accepted', 'partial', 'rejected');
  end if;
end $enum_gr$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Shared trigger helper
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function public.v3_tg_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $fn_v3_set_updated_at$
begin
  new.updated_at := now();
  return new;
end;
$fn_v3_set_updated_at$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Tables
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists public.v3_goods_receipts (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  purchase_order_id uuid not null references public.v3_purchase_orders(id) on delete restrict,
  supplier_id uuid not null references public.v3_suppliers(id) on delete restrict,
  received_at timestamptz not null default now(),
  received_by uuid not null references auth.users(id) on delete no action,
  delivery_note_image_hash text null,
  delivery_note_image_path text null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.v3_goods_receipt_lines (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  goods_receipt_id uuid not null references public.v3_goods_receipts(id) on delete cascade,
  purchase_order_line_id uuid not null references public.v3_purchase_order_lines(id) on delete restrict,
  product_id uuid not null references public.v3_products(id) on delete restrict,
  quantity_received numeric(12,3) not null check (quantity_received >= 0),
  unit_id uuid null references public.v3_units_of_measure(id) on delete set null,
  unit_price numeric(12,4) not null check (unit_price >= 0),
  quality_status public.v3_gr_quality_status not null default 'accepted',
  rejection_reason text null,
  lot_number text null,
  expiry_date date null,
  notes text null,
  created_at timestamptz not null default now(),
  constraint v3_gr_lines_rejection_reason_check check (
    quality_status <> 'rejected'
    or nullif(btrim(rejection_reason), '') is not null
  )
);

create unique index if not exists v3_goods_receipts_hotel_hash_uidx
  on public.v3_goods_receipts(hotel_id, delivery_note_image_hash)
  where delivery_note_image_hash is not null;

create index if not exists v3_goods_receipts_hotel_po_received_idx
  on public.v3_goods_receipts(hotel_id, purchase_order_id, received_at desc);

create index if not exists v3_goods_receipts_hotel_supplier_received_idx
  on public.v3_goods_receipts(hotel_id, supplier_id, received_at desc);

create index if not exists v3_goods_receipt_lines_receipt_idx
  on public.v3_goods_receipt_lines(hotel_id, goods_receipt_id);

create index if not exists v3_goods_receipt_lines_po_line_idx
  on public.v3_goods_receipt_lines(hotel_id, purchase_order_line_id);

create index if not exists v3_goods_receipt_lines_product_created_idx
  on public.v3_goods_receipt_lines(hotel_id, product_id, created_at desc);

-- Composite tenant FKs prevent mixing a row's hotel_id with identifiers from
-- another hotel even if direct UUID FKs would otherwise resolve.
create unique index if not exists v3_goods_receipts_hotel_id_id_uidx
  on public.v3_goods_receipts(hotel_id, id);

create unique index if not exists v3_goods_receipt_lines_hotel_id_id_uidx
  on public.v3_goods_receipt_lines(hotel_id, id);

do $constraints_v3_procurement_gr_tenant$
begin
  if not exists (select 1 from pg_constraint where conname = 'v3_gr_purchase_order_hotel_fkey') then
    alter table public.v3_goods_receipts
      add constraint v3_gr_purchase_order_hotel_fkey
      foreign key (hotel_id, purchase_order_id)
      references public.v3_purchase_orders(hotel_id, id)
      on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_gr_supplier_hotel_fkey') then
    alter table public.v3_goods_receipts
      add constraint v3_gr_supplier_hotel_fkey
      foreign key (hotel_id, supplier_id)
      references public.v3_suppliers(hotel_id, id)
      on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_gr_lines_receipt_hotel_fkey') then
    alter table public.v3_goods_receipt_lines
      add constraint v3_gr_lines_receipt_hotel_fkey
      foreign key (hotel_id, goods_receipt_id)
      references public.v3_goods_receipts(hotel_id, id)
      on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_gr_lines_po_line_hotel_fkey') then
    alter table public.v3_goods_receipt_lines
      add constraint v3_gr_lines_po_line_hotel_fkey
      foreign key (hotel_id, purchase_order_line_id)
      references public.v3_purchase_order_lines(hotel_id, id)
      on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_gr_lines_product_hotel_fkey') then
    alter table public.v3_goods_receipt_lines
      add constraint v3_gr_lines_product_hotel_fkey
      foreign key (hotel_id, product_id)
      references public.v3_products(hotel_id, id)
      on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_gr_lines_unit_hotel_fkey') then
    alter table public.v3_goods_receipt_lines
      add constraint v3_gr_lines_unit_hotel_fkey
      foreign key (hotel_id, unit_id)
      references public.v3_units_of_measure(hotel_id, id)
      on delete no action;
  end if;
end $constraints_v3_procurement_gr_tenant$;

alter table public.v3_goods_receipts enable row level security;
alter table public.v3_goods_receipt_lines enable row level security;

-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS
-- Mutations are centralized in SECURITY DEFINER RPCs; direct writes via
-- PostgREST are deliberately denied.
-- ═══════════════════════════════════════════════════════════════════════════════

drop policy if exists v3_goods_receipts_select_members on public.v3_goods_receipts;
create policy v3_goods_receipts_select_members on public.v3_goods_receipts
  for select using (public.v3_is_member_of(hotel_id));

drop policy if exists v3_goods_receipts_insert_rpc_only on public.v3_goods_receipts;
create policy v3_goods_receipts_insert_rpc_only on public.v3_goods_receipts
  for insert with check (false);

drop policy if exists v3_goods_receipts_update_rpc_only on public.v3_goods_receipts;
create policy v3_goods_receipts_update_rpc_only on public.v3_goods_receipts
  for update using (false) with check (false);

drop policy if exists v3_goods_receipt_lines_select_members on public.v3_goods_receipt_lines;
create policy v3_goods_receipt_lines_select_members on public.v3_goods_receipt_lines
  for select using (public.v3_is_member_of(hotel_id));

drop policy if exists v3_goods_receipt_lines_insert_rpc_only on public.v3_goods_receipt_lines;
create policy v3_goods_receipt_lines_insert_rpc_only on public.v3_goods_receipt_lines
  for insert with check (false);

drop policy if exists v3_goods_receipt_lines_update_rpc_only on public.v3_goods_receipt_lines;
create policy v3_goods_receipt_lines_update_rpc_only on public.v3_goods_receipt_lines
  for update using (false) with check (false);

drop trigger if exists v3_goods_receipts_set_updated_at on public.v3_goods_receipts;
create trigger v3_goods_receipts_set_updated_at
  before update on public.v3_goods_receipts
  for each row
  execute function public.v3_tg_set_updated_at();
