set local search_path = public;
create extension if not exists pgtap;

begin;

select plan(4);

set local role service_role;
insert into public.orgs (id, name, slug)
values ('ffff3333-ffff-4333-8333-ffffffffffff', 'Org Orders', 'org-orders')
on conflict (id) do nothing;

insert into public.hotels (id, org_id, name)
values ('eeee3333-eeee-4333-8333-eeeeeeeeeeee', 'ffff3333-ffff-4333-8333-ffffffffffff', 'Hotel Orders')
on conflict (id) do nothing;

insert into public.org_members (org_id, user_id, role, is_active)
values ('ffff3333-ffff-4333-8333-ffffffffffff', 'ffff9999-ffff-4999-8999-ffffffffffff', 'admin', true)
on conflict (org_id, user_id) do nothing;

set local role authenticated;
set local "request.jwt.claim.sub" = 'ffff9999-ffff-4999-8999-ffffffffffff';
select lives_ok(
  $q$ insert into public.purchase_orders (org_id, hotel_id, status, total_estimated)
      values ('ffff3333-ffff-4333-8333-ffffffffffff', 'eeee3333-eeee-4333-8333-eeeeeeeeeeee', 'draft', '50.00') $q$,
  'miembro puede insertar pedido'
);

select lives_ok(
  $q$ update public.purchase_orders
      set status = 'approved'
      where org_id = 'ffff3333-ffff-4333-8333-ffffffffffff' $q$,
  'miembro puede actualizar pedido de su org'
);

set local "request.jwt.claim.sub" = '00000000-0000-4000-8000-000000000000';
select lives_ok(
  $q$ delete from public.purchase_orders where org_id = 'ffff3333-ffff-4333-8333-ffffffffffff' $q$,
  'delete ignorado por RLS para usuario ajeno'
);

set local role service_role;
select is(
  (select count(*) from public.purchase_orders where org_id = 'ffff3333-ffff-4333-8333-ffffffffffff'),
  1::bigint,
  'usuario ajeno no elimina pedidos de otra org'
);

select * from finish();
rollback;
