set local search_path = public;
create extension if not exists pgtap;

begin;

select plan(6);

-- Datos de prueba
set local role service_role;
insert into public.orgs (id, name, slug)
values ('33333333-3333-4333-8333-333333333333', 'Org Test', 'org-test')
on conflict (id) do nothing;

insert into public.org_members (org_id, user_id, role, is_active)
values
  ('33333333-3333-4333-8333-333333333333', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'admin', true)
on conflict (org_id, user_id) do nothing;

insert into public.hotels (id, org_id, name)
values ('44444444-4444-4444-8444-444444444444', '33333333-3333-4333-8333-333333333333', 'Hotel Test')
on conflict (id) do nothing;

-- Lectura como miembro
set local role authenticated;
set local "request.jwt.claim.sub" = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

select is(
  (select count(*) from public.orgs where id = '33333333-3333-4333-8333-333333333333'),
  1::bigint,
  'miembro ve su organización'
);

select is(
  (select count(*) from public.org_members where org_id = '33333333-3333-4333-8333-333333333333'),
  1::bigint,
  'miembro ve su membership'
);

select is(
  (select count(*) from public.hotels where org_id = '33333333-3333-4333-8333-333333333333'),
  1::bigint,
  'miembro ve hoteles de su org'
);

-- Lectura como otro usuario
set local "request.jwt.claim.sub" = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

select is(
  (select count(*) from public.orgs where id = '33333333-3333-4333-8333-333333333333'),
  0::bigint,
  'usuario ajeno no ve la org'
);

select is(
  (select count(*) from public.org_members where org_id = '33333333-3333-4333-8333-333333333333'),
  0::bigint,
  'usuario ajeno no ve memberships'
);

select is(
  (select count(*) from public.hotels where org_id = '33333333-3333-4333-8333-333333333333'),
  0::bigint,
  'usuario ajeno no ve hoteles'
);

select * from finish();
rollback;
