set local search_path = public;
create extension if not exists pgtap;

begin;
select plan(5);

-- Seed de prueba
set local role service_role;

insert into public.suppliers (id, org_id, name)
values ('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111111', 'Proveedor Demo')
on conflict (id) do nothing;

insert into public.supplier_items (id, org_id, supplier_id, name, purchase_unit, rounding_rule, pack_size)
values (
  '44444444-4444-4444-8444-444444444444',
  '11111111-1111-4111-8111-111111111111',
  '33333333-3333-4333-8333-333333333333',
  'Item demo',
  'ud',
  'none',
  null
)
on conflict (id) do nothing;

insert into public.purchase_orders (id, org_id, hotel_id, supplier_id, order_number, status)
values (
  '55555555-5555-4555-8555-555555555555',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  'PO-TEST',
  'draft'
) on conflict (id) do nothing;

insert into public.org_members (org_id, user_id, role, is_active)
values ('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'admin', true)
on conflict (org_id, user_id) do nothing;

-- Usuario miembro puede ver/insertar líneas
set local role authenticated;
set local "request.jwt.claim.sub" = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

select lives_ok(
  $$ insert into public.purchase_order_lines (
    org_id, purchase_order_id, supplier_item_id, requested_qty, purchase_unit, rounding_rule
  ) values (
    '11111111-1111-4111-8111-111111111111',
    '55555555-5555-4555-8555-555555555555',
    '44444444-4444-4444-8444-444444444444',
    10, 'ud', 'none'
  ) $$,
  'miembro puede insertar línea de PO en su org'
);

select cmp_ok(
  (select count(*) from public.purchase_order_lines where org_id = '11111111-1111-4111-8111-111111111111'),
  '>=',
  1::bigint,
  'miembro ve líneas de su org'
);

select cmp_ok(
  (select count(*) from public.supplier_items where org_id = '11111111-1111-4111-8111-111111111111'),
  '>=',
  1::bigint,
  'miembro ve supplier_items de su org'
);

-- Usuario ajeno no ve datos
set local "request.jwt.claim.sub" = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

select is(
  (select count(*) from public.purchase_order_lines where org_id = '11111111-1111-4111-8111-111111111111'),
  0::bigint,
  'usuario ajeno no ve líneas de PO'
);

select is(
  (select count(*) from public.supplier_items where org_id = '11111111-1111-4111-8111-111111111111'),
  0::bigint,
  'usuario ajeno no ve supplier_items'
);

select * from finish();
rollback;
