set local search_path = public;
create extension if not exists pgtap;

begin;

select plan(4);

set local role service_role;
insert into public.orgs (id, name, slug)
values ('12121212-1212-4121-8121-121212121212', 'Org Admin', 'org-admin')
on conflict (id) do nothing;

insert into public.org_members (org_id, user_id, role, is_active)
values
  ('12121212-1212-4121-8121-121212121212', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'admin', true),
  ('12121212-1212-4121-8121-121212121212', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'planner', true)
on conflict (org_id, user_id) do nothing;

set local role authenticated;
set local "request.jwt.claim.sub" = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

select lives_ok(
  $q$ insert into public.hotels (org_id, name)
      values ('12121212-1212-4121-8121-121212121212', 'Hotel Admin') $q$,
  'admin puede crear hotel'
);

select lives_ok(
  $q$ insert into public.org_members (org_id, user_id, role, is_active)
      values ('12121212-1212-4121-8121-121212121212', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'viewer', true) $q$,
  'admin puede invitar miembro'
);

set local "request.jwt.claim.sub" = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

select throws_ok(
  $q$ insert into public.hotels (org_id, name)
      values ('12121212-1212-4121-8121-121212121212', 'Hotel Ajeno') $q$,
  '42501',
  'new row violates row-level security policy for table "hotels"',
  'miembro no admin no crea hotel'
);

select throws_ok(
  $q$ insert into public.org_members (org_id, user_id, role, is_active)
      values ('12121212-1212-4121-8121-121212121212', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'viewer', true) $q$,
  '42501',
  'new row violates row-level security policy for table "org_members"',
  'miembro no admin no invita miembros'
);

select * from finish();
rollback;
