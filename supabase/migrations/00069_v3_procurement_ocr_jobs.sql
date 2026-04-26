-- 00069_v3_procurement_ocr_jobs.sql
-- Sprint-05c · OCR jobs for procurement invoice/delivery-note review.
-- ADR-0015: all v3-owned DB objects are prefixed with v3_.

do $enum_v3_ocr_job_status$
begin
  if not exists (select 1 from pg_type where typname = 'v3_ocr_job_status') then
    create type public.v3_ocr_job_status as enum (
      'pending',
      'extracted',
      'reviewed',
      'applied',
      'rejected',
      'failed'
    );
  end if;
end $enum_v3_ocr_job_status$;

create or replace function public.v3_tg_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $fn_v3_ocr_set_updated_at$
begin
  new.updated_at := now();
  return new;
end;
$fn_v3_ocr_set_updated_at$;

create table if not exists public.v3_procurement_ocr_jobs (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  supplier_id uuid null references public.v3_suppliers(id) on delete set null,
  purchase_order_id uuid null references public.v3_purchase_orders(id) on delete set null,
  storage_path text not null,
  mime_type text not null check (mime_type in ('application/pdf', 'image/jpeg', 'image/png')),
  sha256 char(64) not null check (sha256 ~ '^[0-9a-f]{64}$'),
  status public.v3_ocr_job_status not null default 'pending',
  extracted_payload jsonb null,
  reviewed_payload jsonb null,
  applied_goods_receipt_id uuid null references public.v3_goods_receipts(id) on delete set null,
  error_code text null,
  error_message text null,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint v3_procurement_ocr_jobs_hotel_sha_unique unique (hotel_id, sha256)
);

create index if not exists v3_procurement_ocr_jobs_hotel_status_created_idx
  on public.v3_procurement_ocr_jobs(hotel_id, status, created_at desc);

create index if not exists v3_procurement_ocr_jobs_hotel_supplier_created_idx
  on public.v3_procurement_ocr_jobs(hotel_id, supplier_id, created_at desc);

do $constraints_v3_procurement_ocr_jobs_tenant$
begin
  if not exists (select 1 from pg_constraint where conname = 'v3_procurement_ocr_jobs_supplier_hotel_fkey') then
    alter table public.v3_procurement_ocr_jobs
      add constraint v3_procurement_ocr_jobs_supplier_hotel_fkey
      foreign key (hotel_id, supplier_id)
      references public.v3_suppliers(hotel_id, id)
      on delete set null (supplier_id);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_procurement_ocr_jobs_po_hotel_fkey') then
    alter table public.v3_procurement_ocr_jobs
      add constraint v3_procurement_ocr_jobs_po_hotel_fkey
      foreign key (hotel_id, purchase_order_id)
      references public.v3_purchase_orders(hotel_id, id)
      on delete set null (purchase_order_id);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_procurement_ocr_jobs_gr_hotel_fkey') then
    alter table public.v3_procurement_ocr_jobs
      add constraint v3_procurement_ocr_jobs_gr_hotel_fkey
      foreign key (hotel_id, applied_goods_receipt_id)
      references public.v3_goods_receipts(hotel_id, id)
      on delete set null (applied_goods_receipt_id);
  end if;
end $constraints_v3_procurement_ocr_jobs_tenant$;

alter table public.v3_procurement_ocr_jobs enable row level security;

drop policy if exists v3_procurement_ocr_jobs_select_members on public.v3_procurement_ocr_jobs;
create policy v3_procurement_ocr_jobs_select_members on public.v3_procurement_ocr_jobs
  for select using (public.v3_is_member_of(hotel_id));

drop policy if exists v3_procurement_ocr_jobs_insert_rpc_only on public.v3_procurement_ocr_jobs;
create policy v3_procurement_ocr_jobs_insert_rpc_only on public.v3_procurement_ocr_jobs
  for insert with check (false);

drop policy if exists v3_procurement_ocr_jobs_update_rpc_only on public.v3_procurement_ocr_jobs;
create policy v3_procurement_ocr_jobs_update_rpc_only on public.v3_procurement_ocr_jobs
  for update using (false) with check (false);

drop trigger if exists v3_procurement_ocr_jobs_set_updated_at on public.v3_procurement_ocr_jobs;
create trigger v3_procurement_ocr_jobs_set_updated_at
  before update on public.v3_procurement_ocr_jobs
  for each row
  execute function public.v3_tg_set_updated_at();
