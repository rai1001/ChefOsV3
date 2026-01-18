set local search_path = public;
create extension if not exists pgtap;

begin;
select plan(4);

-- Datos de prueba
set local role service_role;
insert into public.suppliers (id, org_id, name)
values ('77777777-7777-4777-8777-777777777777', '11111111-1111-4111-8111-111111111111', 'Prov Test')
on conflict (id) do nothing;

insert into public.purchase_orders (id, org_id, hotel_id, supplier_id, status)
values (
  '88888888-8888-4888-8888-888888888888',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '77777777-7777-4777-8777-777777777777',
  'draft'
) on conflict (id) do nothing;

insert into public.org_members (org_id, user_id, role, is_active)
values ('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'admin', true)
on conflict (org_id, user_id) do nothing;

-- Usuario de la org
set local role authenticated;
set local "request.jwt.claim.sub" = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

select cmp_ok(
  (select count(*) from public.suppliers where org_id = '11111111-1111-4111-8111-111111111111'),
  '>=',
  1::bigint,
  'miembro ve proveedores de su org'
);

select cmp_ok(
  (select count(*) from public.purchase_orders where org_id = '11111111-1111-4111-8111-111111111111'),
  '>=',
  1::bigint,
  'miembro ve purchase_orders de su org'
);

-- Usuario ajeno
set local "request.jwt.claim.sub" = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

select is(
  (select count(*) from public.suppliers where org_id = '11111111-1111-4111-8111-111111111111'),
  0::bigint,
  'usuario ajeno no ve proveedores'
);

select is(
  (select count(*) from public.purchase_orders where org_id = '11111111-1111-4111-8111-111111111111'),
  0::bigint,
  'usuario ajeno no ve purchase_orders'
);

select * from finish();
rollback;
