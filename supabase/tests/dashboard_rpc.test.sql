set local search_path = public;
create extension if not exists pgtap;

begin;

select plan(4);

-- Datos
set local role service_role;

insert into public.orgs (id, name, slug)
values ('dddd2222-dddd-4222-8222-dddddddddddd', 'Org Dash', 'org-dash')
on conflict (id) do nothing;

insert into public.hotels (id, org_id, name)
values ('eeee2222-eeee-4222-8222-eeeeeeeeeeee', 'dddd2222-dddd-4222-8222-dddddddddddd', 'Hotel Dash')
on conflict (id) do nothing;

insert into public.events (id, org_id, hotel_id, title, starts_at, ends_at, status)
values (
  'ffff2222-ffff-4222-8222-ffffffffffff',
  'dddd2222-dddd-4222-8222-dddddddddddd',
  'eeee2222-eeee-4222-8222-eeeeeeeeeeee',
  'Evento dashboard',
  now() + interval '1 day',
  now() + interval '1 day' + interval '2 hours',
  'confirmed'
)
on conflict (id) do nothing;

insert into public.purchase_orders (id, org_id, hotel_id, supplier_id, status, total_estimated)
values (
  '11112222-1111-4222-8222-111122221111',
  'dddd2222-dddd-4222-8222-dddddddddddd',
  'eeee2222-eeee-4222-8222-eeeeeeeeeeee',
  null,
  'draft',
  '100.00'
)
on conflict (id) do nothing;

insert into public.org_members (org_id, user_id, role, is_active)
values ('dddd2222-dddd-4222-8222-dddddddddddd', 'dddd9999-dddd-4999-8999-dddddddddddd', 'admin', true)
on conflict (org_id, user_id) do nothing;

set local role authenticated;
set local "request.jwt.claim.sub" = 'dddd9999-dddd-4999-8999-dddddddddddd';
select results_eq(
  $$ select * from public.dashboard_event_highlights('dddd2222-dddd-4222-8222-dddddddddddd') $$,
  $$ values (1::integer, 1::integer) $$,
  'dashboard_event_highlights devuelve conteos para la org'
);

select results_eq(
  $$ select event_title, hotel_name from public.dashboard_rolling_grid('dddd2222-dddd-4222-8222-dddddddddddd') $$,
  $$ values ('Evento dashboard'::text, 'Hotel Dash'::text) $$,
  'dashboard_rolling_grid lista eventos con hotel'
);

-- Usuario ajeno no ve datos (RLS via org_id param)
select results_eq(
  $$ select * from public.dashboard_event_highlights('aaaa1111-aaaa-4111-8111-aaaaaaaaaaaa') $$,
  $$ values (0::integer, 0::integer) $$,
  'otra org no filtra datos de la org dash'
);

select results_eq(
  $$ select count(*) from public.dashboard_rolling_grid('aaaa1111-aaaa-4111-8111-aaaaaaaaaaaa') $$,
  $$ values (0::bigint) $$,
  'otra org no obtiene eventos ajenos'
);

select * from finish();
rollback;
