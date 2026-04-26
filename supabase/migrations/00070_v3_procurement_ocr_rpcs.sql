-- 00070_v3_procurement_ocr_rpcs.sql
-- Sprint-05c · OCR job lifecycle RPCs.
-- ADR-0015: all v3-owned DB objects are prefixed with v3_.

create or replace function public.v3_create_ocr_job(
  p_hotel_id uuid,
  p_storage_path text,
  p_mime_type text,
  p_sha256 text,
  p_supplier_id uuid default null,
  p_purchase_order_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $fn_v3_create_ocr_job$
declare
  v_job_id uuid;
  v_sha256 text := lower(btrim(coalesce(p_sha256, '')));
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array[
      'superadmin','direction','admin','head_chef','sous_chef','procurement','warehouse'
    ]::public.v3_app_role[]
  );

  if p_storage_path is null or btrim(p_storage_path) = '' then
    raise exception 'storage_path is required' using errcode = 'P0003';
  end if;

  if v_sha256 !~ '^[0-9a-f]{64}$' then
    raise exception 'sha256 must be a lowercase hex digest' using errcode = 'P0003';
  end if;

  if p_storage_path not like p_hotel_id::text || '/' || v_sha256 || '.%' then
    raise exception 'storage_path must follow <hotel_id>/<sha256>.<ext>'
      using errcode = 'P0003';
  end if;

  if p_mime_type not in ('application/pdf', 'image/jpeg', 'image/png') then
    raise exception 'unsupported mime_type' using errcode = 'P0003';
  end if;

  insert into public.v3_procurement_ocr_jobs (
    hotel_id,
    supplier_id,
    purchase_order_id,
    storage_path,
    mime_type,
    sha256,
    status,
    created_by
  )
  values (
    p_hotel_id,
    p_supplier_id,
    p_purchase_order_id,
    p_storage_path,
    p_mime_type,
    v_sha256,
    'pending',
    auth.uid()
  )
  on conflict (hotel_id, sha256) do nothing
  returning id into v_job_id;

  if v_job_id is null then
    select id into v_job_id
    from public.v3_procurement_ocr_jobs
    where hotel_id = p_hotel_id
      and sha256 = v_sha256::char(64);
  end if;

  return v_job_id;
end;
$fn_v3_create_ocr_job$;

create or replace function public.v3_set_ocr_job_extracted(
  p_hotel_id uuid,
  p_job_id uuid,
  p_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $fn_v3_set_ocr_job_extracted$
declare
  v_updated integer;
begin
  if coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'service_role required' using errcode = 'P0001';
  end if;

  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'payload must be a JSON object' using errcode = 'P0003';
  end if;

  update public.v3_procurement_ocr_jobs
  set status = 'extracted',
      extracted_payload = p_payload,
      error_code = null,
      error_message = null,
      updated_at = now()
  where hotel_id = p_hotel_id
    and id = p_job_id
    and status = 'pending';

  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'OCR job not found or not pending' using errcode = 'P0012';
  end if;
end;
$fn_v3_set_ocr_job_extracted$;

create or replace function public.v3_set_ocr_job_failed(
  p_hotel_id uuid,
  p_job_id uuid,
  p_error_code text,
  p_error_message text
)
returns void
language plpgsql
security definer
set search_path = public
as $fn_v3_set_ocr_job_failed$
declare
  v_updated integer;
begin
  if coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'service_role required' using errcode = 'P0001';
  end if;

  update public.v3_procurement_ocr_jobs
  set status = 'failed',
      error_code = nullif(btrim(coalesce(p_error_code, '')), ''),
      error_message = left(nullif(btrim(coalesce(p_error_message, '')), ''), 2000),
      updated_at = now()
  where hotel_id = p_hotel_id
    and id = p_job_id
    and status in ('pending', 'extracted');

  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'OCR job not found or not fail-able' using errcode = 'P0012';
  end if;
end;
$fn_v3_set_ocr_job_failed$;

create or replace function public.v3_review_ocr_job(
  p_hotel_id uuid,
  p_job_id uuid,
  p_reviewed_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $fn_v3_review_ocr_job$
declare
  v_job record;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array[
      'superadmin','direction','admin','head_chef','sous_chef','procurement','warehouse'
    ]::public.v3_app_role[]
  );

  if p_reviewed_payload is null
     or jsonb_typeof(p_reviewed_payload) <> 'object'
     or jsonb_typeof(p_reviewed_payload -> 'lines') <> 'array'
     or jsonb_array_length(p_reviewed_payload -> 'lines') = 0 then
    raise exception 'reviewed_payload must contain lines' using errcode = 'P0003';
  end if;

  select *
    into v_job
  from public.v3_procurement_ocr_jobs
  where hotel_id = p_hotel_id
    and id = p_job_id
  for update;

  if v_job.id is null then
    raise exception 'OCR job not found' using errcode = 'P0010';
  end if;

  if v_job.status not in ('extracted', 'reviewed') then
    raise exception 'OCR job must be extracted before review' using errcode = 'P0012';
  end if;

  update public.v3_procurement_ocr_jobs
  set status = 'reviewed',
      reviewed_payload = p_reviewed_payload,
      updated_at = now()
  where hotel_id = p_hotel_id
    and id = p_job_id;
end;
$fn_v3_review_ocr_job$;

create or replace function public.v3_apply_ocr_job(
  p_hotel_id uuid,
  p_job_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_apply_ocr_job$
declare
  v_job record;
  v_payload jsonb;
  v_lines jsonb;
  v_receive_result jsonb;
  v_receipt_id uuid;
  v_recipe_id uuid;
  v_synced_recipes integer := 0;
begin
  -- Applying an OCR job also cascades recipe prices via v3_sync_escandallo_prices,
  -- whose role contract is intentionally stricter than receiving goods.
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef']::public.v3_app_role[]
  );

  select *
    into v_job
  from public.v3_procurement_ocr_jobs
  where hotel_id = p_hotel_id
    and id = p_job_id
  for update;

  if v_job.id is null then
    raise exception 'OCR job not found' using errcode = 'P0010';
  end if;

  if v_job.status = 'applied' and v_job.applied_goods_receipt_id is not null then
    return jsonb_build_object(
      'ocr_job_id', p_job_id,
      'goods_receipt_id', v_job.applied_goods_receipt_id,
      'status', 'applied',
      'idempotent', true
    );
  end if;

  if v_job.status <> 'reviewed' then
    raise exception 'OCR job must be reviewed before apply' using errcode = 'P0012';
  end if;

  if v_job.purchase_order_id is null then
    raise exception 'OCR job requires purchase_order_id before apply' using errcode = 'P0003';
  end if;

  v_payload := v_job.reviewed_payload;
  v_lines := v_payload -> 'lines';

  if v_lines is null or jsonb_typeof(v_lines) <> 'array' or jsonb_array_length(v_lines) = 0 then
    raise exception 'reviewed_payload.lines must contain at least one line'
      using errcode = 'P0003';
  end if;

  v_receive_result := public.v3_receive_goods(
    p_hotel_id,
    v_job.purchase_order_id,
    v_lines,
    now(),
    coalesce(v_payload ->> 'notes', 'OCR job ' || p_job_id::text)
  );

  v_receipt_id := (v_receive_result ->> 'goods_receipt_id')::uuid;

  update public.v3_procurement_ocr_jobs
  set status = 'applied',
      applied_goods_receipt_id = v_receipt_id,
      updated_at = now()
  where hotel_id = p_hotel_id
    and id = p_job_id;

  for v_recipe_id in
    select distinct ri.recipe_id
    from public.v3_goods_receipt_lines grl
    join public.v3_recipe_ingredients ri
      on ri.hotel_id = p_hotel_id
     and ri.product_id = grl.product_id
    where grl.hotel_id = p_hotel_id
      and grl.goods_receipt_id = v_receipt_id
      and ri.recipe_id is not null
  loop
    perform public.v3_sync_escandallo_prices(p_hotel_id, v_recipe_id);
    v_synced_recipes := v_synced_recipes + 1;
  end loop;

  return v_receive_result
    || jsonb_build_object(
      'ocr_job_id', p_job_id,
      'status', 'applied',
      'synced_recipes', v_synced_recipes,
      'idempotent', false
    );
end;
$fn_v3_apply_ocr_job$;

create or replace function public.v3_reject_ocr_job(
  p_hotel_id uuid,
  p_job_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $fn_v3_reject_ocr_job$
declare
  v_job record;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array[
      'superadmin','direction','admin','head_chef','sous_chef','procurement','warehouse'
    ]::public.v3_app_role[]
  );

  select *
    into v_job
  from public.v3_procurement_ocr_jobs
  where hotel_id = p_hotel_id
    and id = p_job_id
  for update;

  if v_job.id is null then
    raise exception 'OCR job not found' using errcode = 'P0010';
  end if;

  if v_job.status = 'applied' then
    raise exception 'applied OCR jobs cannot be rejected' using errcode = 'P0012';
  end if;

  update public.v3_procurement_ocr_jobs
  set status = 'rejected',
      error_code = 'rejected',
      error_message = left(nullif(btrim(coalesce(p_reason, '')), ''), 2000),
      updated_at = now()
  where hotel_id = p_hotel_id
    and id = p_job_id;
end;
$fn_v3_reject_ocr_job$;

revoke all on function public.v3_create_ocr_job(uuid, text, text, text, uuid, uuid) from public, anon, authenticated;
grant execute on function public.v3_create_ocr_job(uuid, text, text, text, uuid, uuid) to authenticated;

revoke all on function public.v3_set_ocr_job_extracted(uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.v3_set_ocr_job_extracted(uuid, uuid, jsonb) to service_role;

revoke all on function public.v3_set_ocr_job_failed(uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.v3_set_ocr_job_failed(uuid, uuid, text, text) to service_role;

revoke all on function public.v3_review_ocr_job(uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.v3_review_ocr_job(uuid, uuid, jsonb) to authenticated;

revoke all on function public.v3_apply_ocr_job(uuid, uuid) from public, anon, authenticated;
grant execute on function public.v3_apply_ocr_job(uuid, uuid) to authenticated;

revoke all on function public.v3_reject_ocr_job(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.v3_reject_ocr_job(uuid, uuid, text) to authenticated;
