-- 00068_v3_procurement_ocr_storage.sql
-- Sprint-05c · private storage bucket for procurement OCR uploads.
-- ADR-0015: v3-owned bucket and policies use v3_ names.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'v3-procurement-uploads',
  'v3-procurement-uploads',
  false,
  8388608,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists v3_procurement_uploads_member_select on storage.objects;
create policy v3_procurement_uploads_member_select on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'v3-procurement-uploads'
    and split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and public.v3_is_member_of(split_part(name, '/', 1)::uuid)
  );

drop policy if exists v3_procurement_uploads_member_insert on storage.objects;
create policy v3_procurement_uploads_member_insert on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'v3-procurement-uploads'
    and split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and public.v3_is_member_of(split_part(name, '/', 1)::uuid)
  );

drop policy if exists v3_procurement_uploads_member_update on storage.objects;
create policy v3_procurement_uploads_member_update on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'v3-procurement-uploads'
    and split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and public.v3_is_member_of(split_part(name, '/', 1)::uuid)
  )
  with check (
    bucket_id = 'v3-procurement-uploads'
    and split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and public.v3_is_member_of(split_part(name, '/', 1)::uuid)
  );

drop policy if exists v3_procurement_uploads_member_delete on storage.objects;
create policy v3_procurement_uploads_member_delete on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'v3-procurement-uploads'
    and split_part(name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and public.v3_is_member_of(split_part(name, '/', 1)::uuid)
  );
