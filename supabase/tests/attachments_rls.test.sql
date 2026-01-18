set local search_path = public;
create extension if not exists pgtap;

begin;

select plan(5);

-- Datos de prueba
set local role service_role;

insert into public.orgs (id, name, slug)
values ('55555555-5555-4555-8555-555555555555', 'Org Attach', 'org-attach')
on conflict (id) do nothing;

insert into public.org_members (org_id, user_id, role, is_active)
values
  ('55555555-5555-4555-8555-555555555555', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'admin', true),
  ('55555555-5555-4555-8555-555555555555', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'viewer', true)
on conflict (org_id, user_id) do nothing;

insert into public.event_attachments (id, org_id, event_id, path, mime_type, size_bytes)
values ('66666666-6666-4666-8666-666666666666', '55555555-5555-4555-8555-555555555555', null, '55555555-5555-4555-8555-555555555555/demo.txt', 'text/plain', 10)
on conflict (id) do nothing;

-- Miembro puede leer su org
set local role authenticated;
set local "request.jwt.claim.sub" = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

select is(
  (select count(*) from public.event_attachments where org_id = '55555555-5555-4555-8555-555555555555'),
  1::bigint,
  'miembro ve adjuntos de su org'
);

-- Otro usuario no ve adjuntos de org ajena
set local "request.jwt.claim.sub" = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

select is(
  (select count(*) from public.event_attachments where org_id = '55555555-5555-4555-8555-555555555555'),
  0::bigint,
  'usuario ajeno no ve adjuntos'
);

-- Insert como miembro permitido
set local "request.jwt.claim.sub" = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
select lives_ok(
  $q$ insert into public.event_attachments (org_id, event_id, path, mime_type, size_bytes)
      values ('55555555-5555-4555-8555-555555555555', null, '55555555-5555-4555-8555-555555555555/ok.txt', 'text/plain', 5) $q$,
  'miembro puede insertar adjunto en su org'
);

-- Delete bloqueado para usuario ajeno (no borra filas)
set local "request.jwt.claim.sub" = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
select lives_ok(
  $q$ delete from public.event_attachments where id = '66666666-6666-4666-8666-666666666666' $q$,
  'delete returns without error'
);

set local role service_role;
select is(
  (select count(*) from public.event_attachments where id = '66666666-6666-4666-8666-666666666666'),
  1::bigint,
  'usuario ajeno no puede borrar adjunto (sigue existiendo)'
);

select * from finish();
rollback;
