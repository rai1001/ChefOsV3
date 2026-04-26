-- 00071_v3_procurement_ocr_service_role_guard.sql
-- Sprint-05c smoke fix: service-role RPCs rely on EXECUTE grants, not JWT claim GUCs.
-- In PostgREST service-role calls the legacy request.jwt.claim.role GUC can be empty.

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
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'extracted payload must be a json object' using errcode = 'P0003';
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
  update public.v3_procurement_ocr_jobs
  set status = 'failed',
      error_code = left(coalesce(nullif(btrim(p_error_code), ''), 'ocr_failed'), 120),
      error_message = left(coalesce(nullif(btrim(p_error_message), ''), 'OCR failed'), 2000),
      updated_at = now()
  where hotel_id = p_hotel_id
    and id = p_job_id
    and status in ('pending', 'extracted');

  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'OCR job not found or cannot be failed' using errcode = 'P0012';
  end if;
end;
$fn_v3_set_ocr_job_failed$;

revoke all on function public.v3_set_ocr_job_extracted(uuid, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.v3_set_ocr_job_failed(uuid, uuid, text, text) from public, anon, authenticated;

grant execute on function public.v3_set_ocr_job_extracted(uuid, uuid, jsonb) to service_role;
grant execute on function public.v3_set_ocr_job_failed(uuid, uuid, text, text) to service_role;
