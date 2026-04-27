-- 00072_v3_inventory_lots.sql
-- Sprint-06 · inventory FIFO lots.
-- ADR-0015: all v3-owned DB objects are prefixed with v3_.

create table if not exists public.v3_inventory_lots (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  product_id uuid not null references public.v3_products(id) on delete restrict,
  goods_receipt_line_id uuid null references public.v3_goods_receipt_lines(id) on delete set null,
  quantity_received numeric(14,4) not null check (quantity_received > 0),
  quantity_remaining numeric(14,4) not null check (quantity_remaining >= 0),
  unit_id uuid not null references public.v3_units_of_measure(id) on delete restrict,
  unit_cost numeric(14,4) not null check (unit_cost >= 0),
  received_at timestamptz not null default now(),
  expires_at timestamptz null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint v3_inventory_lots_remaining_lte_received_check
    check (quantity_remaining <= quantity_received)
);

create unique index if not exists v3_inventory_lots_hotel_id_id_uidx
  on public.v3_inventory_lots(hotel_id, id);

create unique index if not exists v3_inventory_lots_hotel_gr_line_uidx
  on public.v3_inventory_lots(hotel_id, goods_receipt_line_id)
  where goods_receipt_line_id is not null;

create index if not exists v3_inventory_lots_fifo_active_idx
  on public.v3_inventory_lots(hotel_id, product_id, received_at asc, id asc)
  where quantity_remaining > 0;

create index if not exists v3_inventory_lots_product_received_idx
  on public.v3_inventory_lots(hotel_id, product_id, received_at desc);

create index if not exists v3_inventory_lots_gr_line_idx
  on public.v3_inventory_lots(hotel_id, goods_receipt_line_id);

do $constraints_v3_inventory_lots_tenant$
begin
  if not exists (select 1 from pg_constraint where conname = 'v3_inventory_lots_product_hotel_fkey') then
    alter table public.v3_inventory_lots
      add constraint v3_inventory_lots_product_hotel_fkey
      foreign key (hotel_id, product_id)
      references public.v3_products(hotel_id, id)
      on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_inventory_lots_gr_line_hotel_fkey') then
    alter table public.v3_inventory_lots
      add constraint v3_inventory_lots_gr_line_hotel_fkey
      foreign key (hotel_id, goods_receipt_line_id)
      references public.v3_goods_receipt_lines(hotel_id, id)
      on delete set null (goods_receipt_line_id);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_inventory_lots_unit_hotel_fkey') then
    alter table public.v3_inventory_lots
      add constraint v3_inventory_lots_unit_hotel_fkey
      foreign key (hotel_id, unit_id)
      references public.v3_units_of_measure(hotel_id, id)
      on delete restrict;
  end if;
end $constraints_v3_inventory_lots_tenant$;

alter table public.v3_inventory_lots enable row level security;

drop policy if exists v3_inventory_lots_select_members on public.v3_inventory_lots;
create policy v3_inventory_lots_select_members on public.v3_inventory_lots
  for select using (public.v3_is_member_of(hotel_id));

drop policy if exists v3_inventory_lots_insert_rpc_only on public.v3_inventory_lots;
create policy v3_inventory_lots_insert_rpc_only on public.v3_inventory_lots
  for insert with check (false);

drop policy if exists v3_inventory_lots_update_rpc_only on public.v3_inventory_lots;
create policy v3_inventory_lots_update_rpc_only on public.v3_inventory_lots
  for update using (false) with check (false);

drop policy if exists v3_inventory_lots_delete_rpc_only on public.v3_inventory_lots;
create policy v3_inventory_lots_delete_rpc_only on public.v3_inventory_lots
  for delete using (false);

drop trigger if exists v3_inventory_lots_set_updated_at on public.v3_inventory_lots;
create trigger v3_inventory_lots_set_updated_at
  before update on public.v3_inventory_lots
  for each row
  execute function public.v3_tg_set_updated_at();
