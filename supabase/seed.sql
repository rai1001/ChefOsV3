-- Seed idempotente para entorno local/staging
-- Org y hotel base (no crea usuarios: se gestiona en scripts TS)
insert into public.orgs (id, name, slug)
values (
  '11111111-1111-4111-8111-111111111111',
  'ChefOS Demo',
  'chefos-demo'
)
on conflict (id) do update
set name = excluded.name,
    slug = excluded.slug;

insert into public.hotels (id, org_id, name)
values (
  '22222222-2222-4222-8222-222222222222',
  '11111111-1111-4111-8111-111111111111',
  'Hotel Demo'
)
on conflict (id) do update
set name = excluded.name,
    org_id = excluded.org_id;

insert into public.suppliers (id, org_id, name)
values (
  '33333333-3333-4333-8333-333333333333',
  '11111111-1111-4111-8111-111111111111',
  'Proveedor Demo'
)
on conflict (id) do update
set name = excluded.name,
    org_id = excluded.org_id;

insert into public.products (id, org_id, name, unit)
values (
  '44444444-4444-4444-8444-444444444444',
  '11111111-1111-4111-8111-111111111111',
  'Café en grano',
  'kg'
)
on conflict (id) do update
set name = excluded.name,
    unit = excluded.unit,
    org_id = excluded.org_id;

insert into public.purchase_orders (id, org_id, hotel_id, supplier_id, status, total_estimated)
values (
  '55555555-5555-4555-8555-555555555555',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  'draft',
  120.50
)
on conflict (id) do update
set supplier_id = excluded.supplier_id,
    status = excluded.status,
    total_estimated = excluded.total_estimated,
    hotel_id = excluded.hotel_id,
    org_id = excluded.org_id;
