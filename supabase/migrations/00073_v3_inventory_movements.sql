-- 00073_v3_inventory_movements.sql
-- Sprint-06 · append-only inventory movement log.
-- ADR-0015: all v3-owned DB objects are prefixed with v3_.

do $enum_v3_inventory_movement_kind$
begin
  if not exists (select 1 from pg_type where typname = 'v3_inventory_movement_kind') then
    create type public.v3_inventory_movement_kind as enum (
      'receive',
      'consume',
      'waste',
      'adjust_in',
      'adjust_out',
      'transfer_in',
      'transfer_out'
    );
  end if;
end $enum_v3_inventory_movement_kind$;

create unique index if not exists v3_recipes_hotel_id_id_uidx
  on public.v3_recipes(hotel_id, id);

create table if not exists public.v3_inventory_movements (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  product_id uuid not null references public.v3_products(id) on delete restrict,
  lot_id uuid null references public.v3_inventory_lots(id) on delete set null,
  kind public.v3_inventory_movement_kind not null,
  quantity numeric(14,4) not null check (quantity > 0),
  unit_id uuid not null references public.v3_units_of_measure(id) on delete restrict,
  unit_cost numeric(14,4) not null check (unit_cost >= 0),
  total_cost numeric(18,4) generated always as ((quantity * unit_cost)::numeric(18,4)) stored,
  origin jsonb not null default '{}'::jsonb check (jsonb_typeof(origin) = 'object'),
  goods_receipt_line_id uuid null references public.v3_goods_receipt_lines(id) on delete set null,
  recipe_id uuid null references public.v3_recipes(id) on delete set null,
  notes text null,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists v3_inventory_movements_product_created_idx
  on public.v3_inventory_movements(hotel_id, product_id, created_at desc);

create index if not exists v3_inventory_movements_lot_idx
  on public.v3_inventory_movements(hotel_id, lot_id);

create index if not exists v3_inventory_movements_kind_created_idx
  on public.v3_inventory_movements(hotel_id, kind, created_at desc);

do $constraints_v3_inventory_movements_tenant$
begin
  if not exists (select 1 from pg_constraint where conname = 'v3_inventory_movements_product_hotel_fkey') then
    alter table public.v3_inventory_movements
      add constraint v3_inventory_movements_product_hotel_fkey
      foreign key (hotel_id, product_id)
      references public.v3_products(hotel_id, id)
      on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_inventory_movements_lot_hotel_fkey') then
    alter table public.v3_inventory_movements
      add constraint v3_inventory_movements_lot_hotel_fkey
      foreign key (hotel_id, lot_id)
      references public.v3_inventory_lots(hotel_id, id)
      on delete set null (lot_id);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_inventory_movements_unit_hotel_fkey') then
    alter table public.v3_inventory_movements
      add constraint v3_inventory_movements_unit_hotel_fkey
      foreign key (hotel_id, unit_id)
      references public.v3_units_of_measure(hotel_id, id)
      on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_inventory_movements_gr_line_hotel_fkey') then
    alter table public.v3_inventory_movements
      add constraint v3_inventory_movements_gr_line_hotel_fkey
      foreign key (hotel_id, goods_receipt_line_id)
      references public.v3_goods_receipt_lines(hotel_id, id)
      on delete set null (goods_receipt_line_id);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_inventory_movements_recipe_hotel_fkey') then
    alter table public.v3_inventory_movements
      add constraint v3_inventory_movements_recipe_hotel_fkey
      foreign key (hotel_id, recipe_id)
      references public.v3_recipes(hotel_id, id)
      on delete set null (recipe_id);
  end if;
end $constraints_v3_inventory_movements_tenant$;

alter table public.v3_inventory_movements enable row level security;

drop policy if exists v3_inventory_movements_select_members on public.v3_inventory_movements;
create policy v3_inventory_movements_select_members on public.v3_inventory_movements
  for select using (public.v3_is_member_of(hotel_id));

drop policy if exists v3_inventory_movements_insert_rpc_only on public.v3_inventory_movements;
create policy v3_inventory_movements_insert_rpc_only on public.v3_inventory_movements
  for insert with check (false);

drop policy if exists v3_inventory_movements_update_rpc_only on public.v3_inventory_movements;
create policy v3_inventory_movements_update_rpc_only on public.v3_inventory_movements
  for update using (false) with check (false);

drop policy if exists v3_inventory_movements_delete_rpc_only on public.v3_inventory_movements;
create policy v3_inventory_movements_delete_rpc_only on public.v3_inventory_movements
  for delete using (false);
