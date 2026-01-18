set local search_path = public;
create extension if not exists pgtap;

begin;

select plan(6);

-- Datos de prueba
set local role service_role;

insert into public.orgs (id, name, slug)
values ('aaaa1111-aaaa-4111-8111-aaaaaaaaaaaa', 'Org Event', 'org-event')
on conflict (id) do nothing;

insert into public.hotels (id, org_id, name)
values ('bbbb1111-bbbb-4111-8111-bbbbbbbbbbbb', 'aaaa1111-aaaa-4111-8111-aaaaaaaaaaaa', 'Hotel Event')
on conflict (id) do nothing;

insert into public.events (id, org_id, hotel_id, title, starts_at, ends_at, status)
values (
  'cccc1111-cccc-4111-8111-cccccccccccc',
  'aaaa1111-aaaa-4111-8111-aaaaaaaaaaaa',
  'bbbb1111-bbbb-4111-8111-bbbbbbbbbbbb',
  'Evento test',
  now(),
  now() + interval '2 hours',
  'draft'
)
on conflict (id) do nothing;

insert into public.spaces (id, org_id, hotel_id, name)
values (
  'dddd1111-dddd-4111-8111-dddddddddddd',
  'aaaa1111-aaaa-4111-8111-aaaaaaaaaaaa',
  'bbbb1111-bbbb-4111-8111-bbbbbbbbbbbb',
  'Sala test'
)
on conflict (id) do nothing;

insert into public.space_bookings (id, org_id, event_id, space_id, starts_at, ends_at)
values (
  'eeee1111-eeee-4111-8111-eeeeeeeeeeee',
  'aaaa1111-aaaa-4111-8111-aaaaaaaaaaaa',
  'cccc1111-cccc-4111-8111-cccccccccccc',
  'dddd1111-dddd-4111-8111-dddddddddddd',
  now(),
  now() + interval '2 hours'
)
on conflict (id) do nothing;

insert into public.org_members (org_id, user_id, role, is_active)
values ('aaaa1111-aaaa-4111-8111-aaaaaaaaaaaa', 'aaaa9999-aaaa-4999-8999-aaaaaaaaaaaa', 'admin', true)
on conflict (org_id, user_id) do nothing;

set local role authenticated;
set local "request.jwt.claim.sub" = 'aaaa9999-aaaa-4999-8999-aaaaaaaaaaaa';
select is(
  (select count(*) from public.events where org_id = 'aaaa1111-aaaa-4111-8111-aaaaaaaaaaaa'),
  1::bigint,
  'miembro ve eventos de su org'
);

select is(
  (select count(*) from public.space_bookings where org_id = 'aaaa1111-aaaa-4111-8111-aaaaaaaaaaaa'),
  1::bigint,
  'miembro ve bookings de su org'
);

-- Insert permitido
select lives_ok(
  $q$ insert into public.events (org_id, hotel_id, title, starts_at, ends_at, status)
      values ('aaaa1111-aaaa-4111-8111-aaaaaaaaaaaa', 'bbbb1111-bbbb-4111-8111-bbbbbbbbbbbb', 'Nuevo', now(), now() + interval '1 hour', 'draft') $q$,
  'miembro puede crear evento en su org'
);

-- Usuario ajeno no ve datos
set local "request.jwt.claim.sub" = 'bbbb9999-bbbb-4999-8999-bbbbbbbbbbbb';
select is(
  (select count(*) from public.events where org_id = 'aaaa1111-aaaa-4111-8111-aaaaaaaaaaaa'),
  0::bigint,
  'usuario ajeno no ve eventos'
);

-- Delete bloqueado para ajeno (no afecta filas)
select lives_ok(
  $q$ delete from public.events where id = 'cccc1111-cccc-4111-8111-cccccccccccc' $q$,
  'delete ignorado por RLS'
);
set local role service_role;
select is(
  (select count(*) from public.events where id = 'cccc1111-cccc-4111-8111-cccccccccccc'),
  1::bigint,
  'evento sigue existiendo'
);

select * from finish();
rollback;
