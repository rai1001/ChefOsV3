-- Purchasing baseline: suppliers, products, purchase_orders
do $$
begin
  if not exists (select 1 from pg_type where typname = 'purchase_status') then
    create type public.purchase_status as enum ('draft','approved','ordered','received');
  end if;
end $$;

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null,
  unit text not null
);

create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  supplier_id uuid references public.suppliers(id),
  status public.purchase_status default 'draft',
  total_estimated numeric
);

-- RLS
alter table public.suppliers enable row level security;
alter table public.products enable row level security;
alter table public.purchase_orders enable row level security;

-- Policies
create policy "Suppliers readable by members" on public.suppliers
  for select using (is_org_member(org_id));

create policy "Suppliers manageable by service role" on public.suppliers
  for all to service_role using (true) with check (true);

create policy "Products readable by members" on public.products
  for select using (is_org_member(org_id));

create policy "Products manageable by service role" on public.products
  for all to service_role using (true) with check (true);

create policy "Purchase orders readable by members" on public.purchase_orders
  for select using (is_org_member(org_id));

create policy "Purchase orders manageable by service role" on public.purchase_orders
  for all to service_role using (true) with check (true);
