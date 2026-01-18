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
