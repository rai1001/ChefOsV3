set local search_path = public;
create extension if not exists pgtap;

begin;

select plan(4);

set local role service_role;
set local "request.jwt.claim.role" = 'service_role';

select public.onboard_user_org(
  'abababab-abab-4aba-8aba-abababababab',
  'Org Onboard',
  'org-onboard'
) as org_id \gset

select is(
  (select count(*) from public.orgs where id = :'org_id'),
  1::bigint,
  'crea la organizacion'
);

select is(
  (select count(*) from public.org_members where org_id = :'org_id' and user_id = 'abababab-abab-4aba-8aba-abababababab'),
  1::bigint,
  'crea la membership admin'
);

select is(
  (select role from public.org_members where org_id = :'org_id' and user_id = 'abababab-abab-4aba-8aba-abababababab'),
  'admin',
  'asigna rol admin'
);

set local role authenticated;
set local "request.jwt.claim.role" = 'authenticated';

select throws_ok(
  $q$ select public.onboard_user_org(
        'cdcdcdcd-cdcd-4cdc-8cdc-cdcdcdcdcdcd',
        'Org Forbidden',
        'org-forbidden'
      ) $q$,
  '42501',
  'forbidden',
  'bloquea si no es service_role'
);

select * from finish();
rollback;
