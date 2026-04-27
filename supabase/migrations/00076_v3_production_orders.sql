-- 00076_v3_production_orders.sql
-- Sprint-07 · production orders and scaled ingredient snapshots.
-- ADR-0015: all v3-owned DB objects are prefixed with v3_.

do $enum_v3_production_status$
begin
  if not exists (select 1 from pg_type where typname = 'v3_production_status') then
    create type public.v3_production_status as enum (
      'draft',
      'scheduled',
      'in_progress',
      'completed',
      'cancelled'
    );
  end if;
end $enum_v3_production_status$;

create table if not exists public.v3_production_orders (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  recipe_id uuid not null references public.v3_recipes(id) on delete restrict,
  servings numeric(14,4) not null check (servings > 0),
  status public.v3_production_status not null default 'draft',
  scheduled_at timestamptz null,
  started_at timestamptz null,
  completed_at timestamptz null,
  cancelled_at timestamptz null,
  cancellation_reason text null,
  estimated_total_cost numeric(18,4) not null default 0 check (estimated_total_cost >= 0),
  actual_total_cost numeric(18,4) not null default 0 check (actual_total_cost >= 0),
  notes text null,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists v3_production_orders_hotel_id_id_uidx
  on public.v3_production_orders(hotel_id, id);

create index if not exists v3_production_orders_status_scheduled_idx
  on public.v3_production_orders(hotel_id, status, scheduled_at);

create index if not exists v3_production_orders_recipe_created_idx
  on public.v3_production_orders(hotel_id, recipe_id, created_at desc);

do $constraints_v3_production_orders_tenant$
begin
  if not exists (select 1 from pg_constraint where conname = 'v3_production_orders_recipe_hotel_fkey') then
    alter table public.v3_production_orders
      add constraint v3_production_orders_recipe_hotel_fkey
      foreign key (hotel_id, recipe_id)
      references public.v3_recipes(hotel_id, id)
      on delete restrict;
  end if;
end $constraints_v3_production_orders_tenant$;

create table if not exists public.v3_production_order_lines (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  production_order_id uuid not null references public.v3_production_orders(id) on delete cascade,
  product_id uuid not null references public.v3_products(id) on delete restrict,
  quantity_required numeric(14,4) not null check (quantity_required > 0),
  unit_id uuid not null references public.v3_units_of_measure(id) on delete restrict,
  estimated_unit_cost numeric(14,4) not null default 0 check (estimated_unit_cost >= 0),
  estimated_total_cost numeric(18,4)
    generated always as ((quantity_required * estimated_unit_cost)::numeric(18,4)) stored,
  actual_consumed_quantity numeric(14,4) null check (actual_consumed_quantity >= 0),
  actual_total_cost numeric(18,4) null check (actual_total_cost >= 0),
  weighted_unit_cost numeric(14,4) null check (weighted_unit_cost >= 0),
  created_at timestamptz not null default now()
);

create unique index if not exists v3_production_order_lines_hotel_id_id_uidx
  on public.v3_production_order_lines(hotel_id, id);

create index if not exists v3_production_order_lines_order_idx
  on public.v3_production_order_lines(hotel_id, production_order_id);

create index if not exists v3_production_order_lines_product_idx
  on public.v3_production_order_lines(hotel_id, product_id);

do $constraints_v3_production_order_lines_tenant$
begin
  if not exists (select 1 from pg_constraint where conname = 'v3_production_order_lines_order_hotel_fkey') then
    alter table public.v3_production_order_lines
      add constraint v3_production_order_lines_order_hotel_fkey
      foreign key (hotel_id, production_order_id)
      references public.v3_production_orders(hotel_id, id)
      on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_production_order_lines_product_hotel_fkey') then
    alter table public.v3_production_order_lines
      add constraint v3_production_order_lines_product_hotel_fkey
      foreign key (hotel_id, product_id)
      references public.v3_products(hotel_id, id)
      on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_production_order_lines_unit_hotel_fkey') then
    alter table public.v3_production_order_lines
      add constraint v3_production_order_lines_unit_hotel_fkey
      foreign key (hotel_id, unit_id)
      references public.v3_units_of_measure(hotel_id, id)
      on delete restrict;
  end if;
end $constraints_v3_production_order_lines_tenant$;

alter table public.v3_production_orders enable row level security;
alter table public.v3_production_order_lines enable row level security;

drop policy if exists v3_production_orders_select_members on public.v3_production_orders;
create policy v3_production_orders_select_members on public.v3_production_orders
  for select using (public.v3_is_member_of(hotel_id));

drop policy if exists v3_production_orders_insert_rpc_only on public.v3_production_orders;
create policy v3_production_orders_insert_rpc_only on public.v3_production_orders
  for insert with check (false);

drop policy if exists v3_production_orders_update_rpc_only on public.v3_production_orders;
create policy v3_production_orders_update_rpc_only on public.v3_production_orders
  for update using (false) with check (false);

drop policy if exists v3_production_orders_delete_rpc_only on public.v3_production_orders;
create policy v3_production_orders_delete_rpc_only on public.v3_production_orders
  for delete using (false);

drop policy if exists v3_production_order_lines_select_members on public.v3_production_order_lines;
create policy v3_production_order_lines_select_members on public.v3_production_order_lines
  for select using (public.v3_is_member_of(hotel_id));

drop policy if exists v3_production_order_lines_insert_rpc_only on public.v3_production_order_lines;
create policy v3_production_order_lines_insert_rpc_only on public.v3_production_order_lines
  for insert with check (false);

drop policy if exists v3_production_order_lines_update_rpc_only on public.v3_production_order_lines;
create policy v3_production_order_lines_update_rpc_only on public.v3_production_order_lines
  for update using (false) with check (false);

drop policy if exists v3_production_order_lines_delete_rpc_only on public.v3_production_order_lines;
create policy v3_production_order_lines_delete_rpc_only on public.v3_production_order_lines
  for delete using (false);

drop trigger if exists v3_production_orders_set_updated_at on public.v3_production_orders;
create trigger v3_production_orders_set_updated_at
  before update on public.v3_production_orders
  for each row
  execute function public.v3_tg_set_updated_at();
