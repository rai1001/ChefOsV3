set local search_path = public;
create extension if not exists pgtap;

begin;

select plan(3);

-- Prep datos
set local role service_role;
insert into public.orgs (id, name, slug)
values ('55555555-5555-4555-8555-555555555555', 'Org Helper', 'org-helper')
on conflict (id) do nothing;

insert into public.org_members (org_id, user_id, role, is_active)
values
  ('55555555-5555-4555-8555-555555555555', '99999999-9999-4999-8999-999999999999', 'admin', true)
on conflict (org_id, user_id) do nothing;

-- Usuario con membership activa
set local role authenticated;
set local "request.jwt.claim.sub" = '99999999-9999-4999-8999-999999999999';

select is(
  public.current_org_id(),
  '55555555-5555-4555-8555-555555555555'::uuid,
  'current_org_id devuelve la org activa del usuario'
);

-- Usuario sin membership
set local "request.jwt.claim.sub" = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
select is(
  public.current_org_id(),
  null::uuid,
  'current_org_id devuelve null si no hay membership'
);

-- Membership desactivada
set local role service_role;
update public.org_members
set is_active = false
where org_id = '55555555-5555-4555-8555-555555555555'
  and user_id = '99999999-9999-4999-8999-999999999999';

set local role authenticated;
set local "request.jwt.claim.sub" = '99999999-9999-4999-8999-999999999999';
select is(
  public.current_org_id(),
  null::uuid,
  'current_org_id ignora memberships inactivas'
);

select * from finish();
rollback;
