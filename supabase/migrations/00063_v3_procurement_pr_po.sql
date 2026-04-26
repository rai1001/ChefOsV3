-- 00063_v3_procurement_pr_po.sql
-- Sprint-05a · procurement PR/PO base.
-- ADR-0015: all v3-owned DB objects are prefixed with v3_.

-- ═══════════════════════════════════════════════════════════════════════════════
-- Enums
-- ═══════════════════════════════════════════════════════════════════════════════

do $enum_v3_pr_status$
begin
  if not exists (select 1 from pg_type where typname = 'v3_pr_status') then
    create type public.v3_pr_status as enum (
      'draft', 'approved', 'consolidated', 'cancelled'
    );
  end if;
end $enum_v3_pr_status$;

do $enum_v3_pr_origin$
begin
  if not exists (select 1 from pg_type where typname = 'v3_pr_origin') then
    create type public.v3_pr_origin as enum ('manual', 'event', 'production');
  end if;
end $enum_v3_pr_origin$;

do $enum_v3_po_status$
begin
  if not exists (select 1 from pg_type where typname = 'v3_po_status') then
    create type public.v3_po_status as enum (
      'draft', 'sent', 'received_partial', 'received_complete', 'closed', 'cancelled'
    );
  end if;
end $enum_v3_po_status$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Tables
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists public.v3_purchase_requests (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  origin public.v3_pr_origin not null default 'manual',
  status public.v3_pr_status not null default 'draft',
  needed_date date not null,
  event_id uuid null references public.v3_events(id) on delete set null,
  requested_by uuid not null references auth.users(id) on delete no action,
  approved_by uuid null references auth.users(id) on delete no action,
  approved_at timestamptz null,
  consolidated_at timestamptz null,
  cancel_reason text null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint v3_purchase_requests_event_origin_check check (
    (origin = 'event' and event_id is not null) or origin <> 'event'
  )
);

create index if not exists v3_purchase_requests_hotel_status_idx
  on public.v3_purchase_requests(hotel_id, status, needed_date);

create unique index if not exists v3_pr_event_origin_unique
  on public.v3_purchase_requests(hotel_id, event_id)
  where origin = 'event' and event_id is not null;

create table if not exists public.v3_purchase_request_lines (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  purchase_request_id uuid not null references public.v3_purchase_requests(id) on delete cascade,
  product_id uuid not null references public.v3_products(id) on delete restrict,
  quantity numeric(12,3) not null check (quantity > 0),
  unit_id uuid null references public.v3_units_of_measure(id) on delete set null,
  event_id uuid null references public.v3_events(id) on delete set null,
  department public.v3_department not null default 'general',
  notes text null,
  created_at timestamptz not null default now()
);

create index if not exists v3_purchase_request_lines_request_idx
  on public.v3_purchase_request_lines(hotel_id, purchase_request_id);

create table if not exists public.v3_purchase_orders (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  supplier_id uuid not null references public.v3_suppliers(id) on delete restrict,
  status public.v3_po_status not null default 'draft',
  order_date date not null default current_date,
  expected_delivery_date date null,
  created_by uuid not null references auth.users(id) on delete no action,
  approved_by uuid null references auth.users(id) on delete no action,
  sent_at timestamptz null,
  cancel_reason text null,
  pdf_path text null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists v3_purchase_orders_hotel_status_idx
  on public.v3_purchase_orders(hotel_id, status, order_date);

create table if not exists public.v3_purchase_order_lines (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  purchase_order_id uuid not null references public.v3_purchase_orders(id) on delete cascade,
  purchase_request_line_id uuid null references public.v3_purchase_request_lines(id) on delete set null,
  product_id uuid not null references public.v3_products(id) on delete restrict,
  quantity_ordered numeric(12,3) not null check (quantity_ordered > 0),
  quantity_received numeric(12,3) not null default 0 check (quantity_received >= 0),
  unit_id uuid null references public.v3_units_of_measure(id) on delete set null,
  event_id uuid null references public.v3_events(id) on delete set null,
  department public.v3_department not null default 'general',
  last_unit_price numeric(12,4) null check (last_unit_price is null or last_unit_price >= 0),
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists v3_purchase_order_lines_order_idx
  on public.v3_purchase_order_lines(hotel_id, purchase_order_id);

create unique index if not exists v3_po_line_pr_line_unique
  on public.v3_purchase_order_lines(hotel_id, purchase_request_line_id)
  where purchase_request_line_id is not null;

create table if not exists public.v3_price_change_log (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  product_id uuid not null references public.v3_products(id) on delete cascade,
  purchase_order_line_id uuid null references public.v3_purchase_order_lines(id) on delete set null,
  old_price numeric(12,4) null,
  new_price numeric(12,4) not null check (new_price >= 0),
  source text not null,
  delta_pct numeric(12,4) null,
  detected_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists v3_price_change_log_product_idx
  on public.v3_price_change_log(hotel_id, product_id, detected_at desc);

-- Composite tenant FKs prevent direct writes from mixing a row's hotel_id with
-- product/order/request identifiers that belong to another hotel.
create unique index if not exists v3_purchase_requests_hotel_id_id_uidx
  on public.v3_purchase_requests(hotel_id, id);

create unique index if not exists v3_purchase_request_lines_hotel_id_id_uidx
  on public.v3_purchase_request_lines(hotel_id, id);

create unique index if not exists v3_purchase_orders_hotel_id_id_uidx
  on public.v3_purchase_orders(hotel_id, id);

create unique index if not exists v3_purchase_order_lines_hotel_id_id_uidx
  on public.v3_purchase_order_lines(hotel_id, id);

create unique index if not exists v3_products_hotel_id_id_uidx
  on public.v3_products(hotel_id, id);

create unique index if not exists v3_units_of_measure_hotel_id_id_uidx
  on public.v3_units_of_measure(hotel_id, id);

create unique index if not exists v3_suppliers_hotel_id_id_uidx
  on public.v3_suppliers(hotel_id, id);

do $constraints_v3_procurement_tenant$
begin
  if not exists (select 1 from pg_constraint where conname = 'v3_pr_lines_request_hotel_fkey') then
    alter table public.v3_purchase_request_lines
      add constraint v3_pr_lines_request_hotel_fkey
      foreign key (hotel_id, purchase_request_id)
      references public.v3_purchase_requests(hotel_id, id)
      on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_pr_lines_product_hotel_fkey') then
    alter table public.v3_purchase_request_lines
      add constraint v3_pr_lines_product_hotel_fkey
      foreign key (hotel_id, product_id)
      references public.v3_products(hotel_id, id)
      on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_pr_lines_unit_hotel_fkey') then
    alter table public.v3_purchase_request_lines
      add constraint v3_pr_lines_unit_hotel_fkey
      foreign key (hotel_id, unit_id)
      references public.v3_units_of_measure(hotel_id, id)
      on delete no action;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_purchase_orders_supplier_hotel_fkey') then
    alter table public.v3_purchase_orders
      add constraint v3_purchase_orders_supplier_hotel_fkey
      foreign key (hotel_id, supplier_id)
      references public.v3_suppliers(hotel_id, id)
      on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_po_lines_order_hotel_fkey') then
    alter table public.v3_purchase_order_lines
      add constraint v3_po_lines_order_hotel_fkey
      foreign key (hotel_id, purchase_order_id)
      references public.v3_purchase_orders(hotel_id, id)
      on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_po_lines_pr_line_hotel_fkey') then
    alter table public.v3_purchase_order_lines
      add constraint v3_po_lines_pr_line_hotel_fkey
      foreign key (hotel_id, purchase_request_line_id)
      references public.v3_purchase_request_lines(hotel_id, id)
      on delete no action;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_po_lines_product_hotel_fkey') then
    alter table public.v3_purchase_order_lines
      add constraint v3_po_lines_product_hotel_fkey
      foreign key (hotel_id, product_id)
      references public.v3_products(hotel_id, id)
      on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_po_lines_unit_hotel_fkey') then
    alter table public.v3_purchase_order_lines
      add constraint v3_po_lines_unit_hotel_fkey
      foreign key (hotel_id, unit_id)
      references public.v3_units_of_measure(hotel_id, id)
      on delete no action;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_price_change_log_product_hotel_fkey') then
    alter table public.v3_price_change_log
      add constraint v3_price_change_log_product_hotel_fkey
      foreign key (hotel_id, product_id)
      references public.v3_products(hotel_id, id)
      on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_price_change_log_po_line_hotel_fkey') then
    alter table public.v3_price_change_log
      add constraint v3_price_change_log_po_line_hotel_fkey
      foreign key (hotel_id, purchase_order_line_id)
      references public.v3_purchase_order_lines(hotel_id, id)
      on delete no action;
  end if;
end $constraints_v3_procurement_tenant$;

alter table public.v3_purchase_requests enable row level security;
alter table public.v3_purchase_request_lines enable row level security;
alter table public.v3_purchase_orders enable row level security;
alter table public.v3_purchase_order_lines enable row level security;
alter table public.v3_price_change_log enable row level security;

-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS
-- Direct writes are role-gated for operational tooling; application UI must still
-- use RPCs so state transitions and idempotency stay centralized.
-- ═══════════════════════════════════════════════════════════════════════════════

drop policy if exists v3_purchase_requests_select_members on public.v3_purchase_requests;
create policy v3_purchase_requests_select_members on public.v3_purchase_requests
  for select using (public.v3_is_member_of(hotel_id));

drop policy if exists v3_purchase_requests_insert_roles on public.v3_purchase_requests;
create policy v3_purchase_requests_insert_roles on public.v3_purchase_requests
  for insert with check (
    public.v3_get_member_role(hotel_id) in (
      'superadmin','direction','admin','head_chef','sous_chef','procurement'
    )
  );

drop policy if exists v3_purchase_requests_update_roles on public.v3_purchase_requests;
create policy v3_purchase_requests_update_roles on public.v3_purchase_requests
  for update using (
    public.v3_get_member_role(hotel_id) in (
      'superadmin','direction','admin','head_chef','sous_chef','procurement'
    )
  )
  with check (
    public.v3_get_member_role(hotel_id) in (
      'superadmin','direction','admin','head_chef','sous_chef','procurement'
    )
  );

drop policy if exists v3_purchase_request_lines_select_members on public.v3_purchase_request_lines;
create policy v3_purchase_request_lines_select_members on public.v3_purchase_request_lines
  for select using (public.v3_is_member_of(hotel_id));

drop policy if exists v3_purchase_request_lines_insert_roles on public.v3_purchase_request_lines;
create policy v3_purchase_request_lines_insert_roles on public.v3_purchase_request_lines
  for insert with check (
    public.v3_get_member_role(hotel_id) in (
      'superadmin','direction','admin','head_chef','sous_chef','procurement'
    )
  );

drop policy if exists v3_purchase_request_lines_update_roles on public.v3_purchase_request_lines;
create policy v3_purchase_request_lines_update_roles on public.v3_purchase_request_lines
  for update using (
    public.v3_get_member_role(hotel_id) in (
      'superadmin','direction','admin','head_chef','sous_chef','procurement'
    )
  )
  with check (
    public.v3_get_member_role(hotel_id) in (
      'superadmin','direction','admin','head_chef','sous_chef','procurement'
    )
  );

drop policy if exists v3_purchase_orders_select_members on public.v3_purchase_orders;
create policy v3_purchase_orders_select_members on public.v3_purchase_orders
  for select using (public.v3_is_member_of(hotel_id));

drop policy if exists v3_purchase_orders_insert_roles on public.v3_purchase_orders;
create policy v3_purchase_orders_insert_roles on public.v3_purchase_orders
  for insert with check (
    public.v3_get_member_role(hotel_id) in (
      'superadmin','direction','admin','head_chef','sous_chef','procurement'
    )
  );

drop policy if exists v3_purchase_orders_update_roles on public.v3_purchase_orders;
create policy v3_purchase_orders_update_roles on public.v3_purchase_orders
  for update using (
    public.v3_get_member_role(hotel_id) in (
      'superadmin','direction','admin','head_chef','sous_chef','procurement'
    )
  )
  with check (
    public.v3_get_member_role(hotel_id) in (
      'superadmin','direction','admin','head_chef','sous_chef','procurement'
    )
  );

drop policy if exists v3_purchase_order_lines_select_members on public.v3_purchase_order_lines;
create policy v3_purchase_order_lines_select_members on public.v3_purchase_order_lines
  for select using (public.v3_is_member_of(hotel_id));

drop policy if exists v3_purchase_order_lines_insert_roles on public.v3_purchase_order_lines;
create policy v3_purchase_order_lines_insert_roles on public.v3_purchase_order_lines
  for insert with check (
    public.v3_get_member_role(hotel_id) in (
      'superadmin','direction','admin','head_chef','sous_chef','procurement'
    )
  );

drop policy if exists v3_purchase_order_lines_update_roles on public.v3_purchase_order_lines;
create policy v3_purchase_order_lines_update_roles on public.v3_purchase_order_lines
  for update using (
    public.v3_get_member_role(hotel_id) in (
      'superadmin','direction','admin','head_chef','sous_chef','procurement','warehouse'
    )
  )
  with check (
    public.v3_get_member_role(hotel_id) in (
      'superadmin','direction','admin','head_chef','sous_chef','procurement','warehouse'
    )
  );

drop policy if exists v3_price_change_log_select_members on public.v3_price_change_log;
create policy v3_price_change_log_select_members on public.v3_price_change_log
  for select using (public.v3_is_member_of(hotel_id));

drop policy if exists v3_price_change_log_insert_roles on public.v3_price_change_log;
create policy v3_price_change_log_insert_roles on public.v3_price_change_log
  for insert with check (
    public.v3_get_member_role(hotel_id) in (
      'superadmin','direction','admin','head_chef','procurement','warehouse'
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════════
-- State machines
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function public.v3_validate_pr_transition(
  p_from public.v3_pr_status,
  p_to public.v3_pr_status
)
returns boolean
language sql
immutable
set search_path = public
as $$
  select (p_from, p_to) in (
    ('draft'::public.v3_pr_status, 'approved'::public.v3_pr_status),
    ('draft'::public.v3_pr_status, 'cancelled'::public.v3_pr_status),
    ('approved'::public.v3_pr_status, 'consolidated'::public.v3_pr_status),
    ('approved'::public.v3_pr_status, 'cancelled'::public.v3_pr_status)
  );
$$;

create or replace function public.v3_validate_po_transition(
  p_from public.v3_po_status,
  p_to public.v3_po_status
)
returns boolean
language sql
immutable
set search_path = public
as $$
  select (p_from, p_to) in (
    ('draft'::public.v3_po_status, 'sent'::public.v3_po_status),
    ('draft'::public.v3_po_status, 'cancelled'::public.v3_po_status),
    ('sent'::public.v3_po_status, 'received_partial'::public.v3_po_status),
    ('sent'::public.v3_po_status, 'received_complete'::public.v3_po_status),
    ('sent'::public.v3_po_status, 'cancelled'::public.v3_po_status),
    ('received_partial'::public.v3_po_status, 'received_complete'::public.v3_po_status),
    ('received_partial'::public.v3_po_status, 'closed'::public.v3_po_status),
    ('received_complete'::public.v3_po_status, 'closed'::public.v3_po_status)
  );
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Purchase Request RPCs
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function public.v3_create_purchase_request(
  p_hotel_id uuid,
  p_origin public.v3_pr_origin,
  p_needed_date date,
  p_event_id uuid default null,
  p_notes text default null,
  p_lines jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request_id uuid;
  v_line_count integer;
  v_inserted_count integer;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef','sous_chef','procurement']::public.v3_app_role[]
  );

  if p_origin = 'event' and p_event_id is null then
    raise exception 'event origin requires event_id' using errcode = 'P0003';
  end if;

  if p_needed_date is null then
    raise exception 'needed_date is required' using errcode = 'P0003';
  end if;

  if jsonb_typeof(coalesce(p_lines, '[]'::jsonb)) <> 'array' then
    raise exception 'p_lines must be a JSON array' using errcode = 'P0003';
  end if;

  select count(*) into v_line_count
  from jsonb_array_elements(coalesce(p_lines, '[]'::jsonb));

  if v_line_count = 0 then
    raise exception 'purchase request requires at least one line' using errcode = 'P0003';
  end if;

  insert into public.v3_purchase_requests (
    hotel_id, origin, status, needed_date, event_id, requested_by, notes
  )
  values (
    p_hotel_id, p_origin, 'draft', p_needed_date, p_event_id, auth.uid(), p_notes
  )
  returning id into v_request_id;

  with parsed as (
    select
      (line->>'product_id')::uuid as product_id,
      nullif(line->>'unit_id', '')::uuid as unit_id,
      coalesce(nullif(line->>'quantity', '')::numeric, 0) as quantity,
      coalesce(nullif(line->>'event_id', '')::uuid, p_event_id) as event_id,
      coalesce(nullif(line->>'department', '')::public.v3_department, 'general') as department,
      nullif(line->>'notes', '') as notes
    from jsonb_array_elements(coalesce(p_lines, '[]'::jsonb)) as line
  ),
  valid as (
    select parsed.*
    from parsed
    join public.v3_products p
      on p.id = parsed.product_id
     and p.hotel_id = p_hotel_id
    left join public.v3_units_of_measure u
      on u.id = parsed.unit_id
     and u.hotel_id = p_hotel_id
    where parsed.quantity > 0
      and (parsed.unit_id is null or u.id is not null)
  )
  insert into public.v3_purchase_request_lines (
    hotel_id, purchase_request_id, product_id, quantity, unit_id, event_id, department, notes
  )
  select
    p_hotel_id, v_request_id, product_id, quantity, unit_id, event_id, department, notes
  from valid;

  get diagnostics v_inserted_count = row_count;

  if v_inserted_count <> v_line_count then
    raise exception 'invalid purchase request line: product/unit hotel mismatch or non-positive quantity'
      using errcode = 'P0003';
  end if;

  perform public.v3_emit_event(
    p_hotel_id,
    'purchase_request',
    v_request_id,
    'purchase_request.created',
    jsonb_build_object('origin', p_origin, 'event_id', p_event_id, 'line_count', v_inserted_count)
  );

  return v_request_id;
end;
$$;

create or replace function public.v3_transition_purchase_request(
  p_hotel_id uuid,
  p_request_id uuid,
  p_new_status public.v3_pr_status,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_status public.v3_pr_status;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef','sous_chef','procurement']::public.v3_app_role[]
  );

  select status into v_current_status
  from public.v3_purchase_requests
  where id = p_request_id
    and hotel_id = p_hotel_id
  for update;

  if v_current_status is null then
    raise exception 'purchase request not found' using errcode = 'P0010';
  end if;

  if not public.v3_validate_pr_transition(v_current_status, p_new_status) then
    raise exception 'invalid purchase request transition: % -> %', v_current_status, p_new_status
      using errcode = 'P0012';
  end if;

  if p_new_status = 'cancelled' and (p_reason is null or btrim(p_reason) = '') then
    raise exception 'cancel reason is required' using errcode = 'P0014';
  end if;

  update public.v3_purchase_requests
  set status = p_new_status,
      approved_by = case when p_new_status = 'approved' then auth.uid() else approved_by end,
      approved_at = case when p_new_status = 'approved' then now() else approved_at end,
      consolidated_at = case when p_new_status = 'consolidated' then now() else consolidated_at end,
      cancel_reason = case when p_new_status = 'cancelled' then p_reason else cancel_reason end,
      updated_at = now()
  where id = p_request_id
    and hotel_id = p_hotel_id;

  perform public.v3_emit_event(
    p_hotel_id,
    'purchase_request',
    p_request_id,
    'purchase_request.' || p_new_status::text,
    jsonb_build_object('from', v_current_status, 'to', p_new_status, 'reason', p_reason)
  );
end;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Purchase Order RPCs
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function public.v3_generate_purchase_order(
  p_hotel_id uuid,
  p_pr_ids uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expected_count integer;
  v_locked_count integer;
  v_supplier record;
  v_po_id uuid;
  v_po_ids uuid[] := array[]::uuid[];
  v_consolidated_ids uuid[] := array[]::uuid[];
  v_unassigned_lines jsonb := '[]'::jsonb;
  v_request_id uuid;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef','sous_chef','procurement']::public.v3_app_role[]
  );

  if p_pr_ids is null or array_length(p_pr_ids, 1) is null then
    raise exception 'p_pr_ids is required' using errcode = 'P0003';
  end if;

  select count(distinct id) into v_expected_count
  from unnest(p_pr_ids) as input(id);

  with locked as (
    select id
    from public.v3_purchase_requests
    where hotel_id = p_hotel_id
      and id = any(p_pr_ids)
      and status = 'approved'
    for update
  )
  select count(*) into v_locked_count from locked;

  if v_locked_count <> v_expected_count then
    raise exception 'all purchase requests must exist, belong to hotel, and be approved'
      using errcode = 'P0003';
  end if;

  with candidate_lines as (
    select
      pr.id as request_id,
      prl.id as request_line_id,
      prl.product_id,
      prl.quantity,
      prl.unit_id,
      prl.event_id,
      prl.department,
      offer.supplier_id,
      offer.unit_id as offer_unit_id,
      offer.unit_price
    from public.v3_purchase_requests pr
    join public.v3_purchase_request_lines prl
      on prl.purchase_request_id = pr.id
     and prl.hotel_id = p_hotel_id
    left join lateral (
      select so.supplier_id, so.unit_id, so.unit_price
      from public.v3_supplier_offers so
      where so.hotel_id = p_hotel_id
        and so.product_id = prl.product_id
        and (so.valid_from is null or so.valid_from <= current_date)
        and (so.valid_to is null or so.valid_to >= current_date)
      order by so.is_preferred desc, so.unit_price asc, so.updated_at desc
      limit 1
    ) offer on true
    where pr.hotel_id = p_hotel_id
      and pr.id = any(p_pr_ids)
      and pr.status = 'approved'
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'purchase_request_id', request_id,
    'purchase_request_line_id', request_line_id,
    'product_id', product_id,
    'quantity', quantity
  )), '[]'::jsonb)
  into v_unassigned_lines
  from candidate_lines
  where supplier_id is null;

  for v_supplier in
    with candidate_lines as (
      select distinct offer.supplier_id
      from public.v3_purchase_requests pr
      join public.v3_purchase_request_lines prl
        on prl.purchase_request_id = pr.id
       and prl.hotel_id = p_hotel_id
      join lateral (
        select so.supplier_id
        from public.v3_supplier_offers so
        where so.hotel_id = p_hotel_id
          and so.product_id = prl.product_id
          and (so.valid_from is null or so.valid_from <= current_date)
          and (so.valid_to is null or so.valid_to >= current_date)
        order by so.is_preferred desc, so.unit_price asc, so.updated_at desc
        limit 1
      ) offer on true
      where pr.hotel_id = p_hotel_id
        and pr.id = any(p_pr_ids)
        and pr.status = 'approved'
    )
    select supplier_id from candidate_lines
  loop
    insert into public.v3_purchase_orders (
      hotel_id, supplier_id, status, order_date, created_by
    )
    values (
      p_hotel_id, v_supplier.supplier_id, 'draft', current_date, auth.uid()
    )
    returning id into v_po_id;

    v_po_ids := array_append(v_po_ids, v_po_id);

    insert into public.v3_purchase_order_lines (
      hotel_id,
      purchase_order_id,
      purchase_request_line_id,
      product_id,
      quantity_ordered,
      quantity_received,
      unit_id,
      event_id,
      department,
      last_unit_price
    )
    select
      p_hotel_id,
      v_po_id,
      request_line_id,
      product_id,
      quantity,
      0,
      coalesce(offer_unit_id, unit_id),
      event_id,
      department,
      unit_price
    from (
      select
        prl.id as request_line_id,
        prl.product_id,
        prl.quantity,
        prl.unit_id,
        prl.event_id,
        prl.department,
        offer.supplier_id,
        offer.unit_id as offer_unit_id,
        offer.unit_price
      from public.v3_purchase_requests pr
      join public.v3_purchase_request_lines prl
        on prl.purchase_request_id = pr.id
       and prl.hotel_id = p_hotel_id
      join lateral (
        select so.supplier_id, so.unit_id, so.unit_price
        from public.v3_supplier_offers so
        where so.hotel_id = p_hotel_id
          and so.product_id = prl.product_id
          and (so.valid_from is null or so.valid_from <= current_date)
          and (so.valid_to is null or so.valid_to >= current_date)
        order by so.is_preferred desc, so.unit_price asc, so.updated_at desc
        limit 1
      ) offer on true
      where pr.hotel_id = p_hotel_id
        and pr.id = any(p_pr_ids)
        and pr.status = 'approved'
        and offer.supplier_id = v_supplier.supplier_id
    ) assigned
    on conflict do nothing;

    perform public.v3_emit_event(
      p_hotel_id,
      'purchase_order',
      v_po_id,
      'purchase_order.created',
      jsonb_build_object('supplier_id', v_supplier.supplier_id)
    );
  end loop;

  with line_assignment as (
    select
      pr.id as request_id,
      bool_and(offer.supplier_id is not null) as fully_assigned
    from public.v3_purchase_requests pr
    join public.v3_purchase_request_lines prl
      on prl.purchase_request_id = pr.id
     and prl.hotel_id = p_hotel_id
    left join lateral (
      select so.supplier_id
      from public.v3_supplier_offers so
      where so.hotel_id = p_hotel_id
        and so.product_id = prl.product_id
        and (so.valid_from is null or so.valid_from <= current_date)
        and (so.valid_to is null or so.valid_to >= current_date)
      order by so.is_preferred desc, so.unit_price asc, so.updated_at desc
      limit 1
    ) offer on true
    where pr.hotel_id = p_hotel_id
      and pr.id = any(p_pr_ids)
      and pr.status = 'approved'
    group by pr.id
  ),
  updated as (
    update public.v3_purchase_requests pr
    set status = 'consolidated',
        consolidated_at = now(),
        updated_at = now()
    from line_assignment la
    where pr.id = la.request_id
      and pr.hotel_id = p_hotel_id
      and la.fully_assigned
    returning pr.id
  )
  select coalesce(array_agg(id), array[]::uuid[]) into v_consolidated_ids
  from updated;

  foreach v_request_id in array v_consolidated_ids loop
    perform public.v3_emit_event(
      p_hotel_id,
      'purchase_request',
      v_request_id,
      'purchase_request.consolidated',
      jsonb_build_object('purchase_order_ids', v_po_ids)
    );
  end loop;

  return jsonb_build_object(
    'purchase_order_ids', coalesce(to_jsonb(v_po_ids), '[]'::jsonb),
    'unassigned_lines', v_unassigned_lines,
    'consolidated_request_ids', coalesce(to_jsonb(v_consolidated_ids), '[]'::jsonb)
  );
end;
$$;

create or replace function public.v3_transition_purchase_order(
  p_hotel_id uuid,
  p_order_id uuid,
  p_new_status public.v3_po_status,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_status public.v3_po_status;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef','sous_chef','procurement']::public.v3_app_role[]
  );

  select status into v_current_status
  from public.v3_purchase_orders
  where id = p_order_id
    and hotel_id = p_hotel_id
  for update;

  if v_current_status is null then
    raise exception 'purchase order not found' using errcode = 'P0010';
  end if;

  if not public.v3_validate_po_transition(v_current_status, p_new_status) then
    raise exception 'invalid purchase order transition: % -> %', v_current_status, p_new_status
      using errcode = 'P0012';
  end if;

  if p_new_status = 'cancelled' and (p_reason is null or btrim(p_reason) = '') then
    raise exception 'cancel reason is required' using errcode = 'P0014';
  end if;

  update public.v3_purchase_orders
  set status = p_new_status,
      sent_at = case when p_new_status = 'sent' then now() else sent_at end,
      approved_by = case when p_new_status = 'sent' then auth.uid() else approved_by end,
      cancel_reason = case when p_new_status = 'cancelled' then p_reason else cancel_reason end,
      updated_at = now()
  where id = p_order_id
    and hotel_id = p_hotel_id;

  perform public.v3_emit_event(
    p_hotel_id,
    'purchase_order',
    p_order_id,
    'purchase_order.' || p_new_status::text,
    jsonb_build_object('from', v_current_status, 'to', p_new_status, 'reason', p_reason)
  );
end;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- event.confirmed -> Purchase Request consumer
-- ═══════════════════════════════════════════════════════════════════════════════

create or replace function public.v3_generate_purchase_requests_for_event_internal(
  p_hotel_id uuid,
  p_event_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event record;
  v_request_id uuid;
  v_existing_id uuid;
  v_lines_created integer := 0;
  v_skipped_unmapped integer := 0;
begin
  select * into v_event
  from public.v3_events
  where id = p_event_id
    and hotel_id = p_hotel_id;

  if not found or v_event.status <> 'confirmed' then
    return jsonb_build_object(
      'purchase_request_id', null,
      'created', false,
      'lines_created', 0,
      'skipped_unmapped_lines', 0
    );
  end if;

  select id into v_existing_id
  from public.v3_purchase_requests
  where hotel_id = p_hotel_id
    and event_id = p_event_id
    and origin = 'event'
  limit 1;

  if v_existing_id is not null then
    select count(*) into v_lines_created
    from public.v3_purchase_request_lines
    where hotel_id = p_hotel_id
      and purchase_request_id = v_existing_id;

    return jsonb_build_object(
      'purchase_request_id', v_existing_id,
      'created', false,
      'lines_created', v_lines_created,
      'skipped_unmapped_lines', 0
    );
  end if;

  with unmapped as (
    select ri.id
    from public.v3_event_menus em
    join public.v3_menus m on m.id = em.menu_id and m.hotel_id = p_hotel_id
    join public.v3_menu_sections ms on ms.menu_id = m.id and ms.hotel_id = p_hotel_id
    join public.v3_menu_section_recipes msr on msr.section_id = ms.id and msr.hotel_id = p_hotel_id
    join public.v3_recipes r on r.id = msr.recipe_id and r.hotel_id = p_hotel_id
    join public.v3_recipe_ingredients ri on ri.recipe_id = r.id and ri.hotel_id = p_hotel_id
    where em.hotel_id = p_hotel_id
      and em.event_id = p_event_id
      and r.status = 'approved'
      and ri.quantity_gross > 0
      and ri.product_id is null
  )
  select count(*) into v_skipped_unmapped from unmapped;

  insert into public.v3_purchase_requests (
    hotel_id, origin, status, needed_date, event_id, requested_by, notes
  )
  values (
    p_hotel_id,
    'event',
    'draft',
    v_event.event_date,
    p_event_id,
    v_event.created_by,
    'Auto-generada al confirmar evento'
  )
  returning id into v_request_id;

  with existing_impact as (
    select
      product_id,
      quantity_needed as quantity,
      null::uuid as unit_id,
      department
    from public.v3_event_operational_impact
    where hotel_id = p_hotel_id
      and event_id = p_event_id
      and product_id is not null
      and quantity_needed > 0
  ),
  derived_impact as (
    select
      ri.product_id,
      round(sum(
        ri.quantity_gross
        * coalesce(em.servings_override, v_event.guest_count, 1)::numeric
        * coalesce(msr.servings_override, 1)::numeric
        / nullif(r.servings, 0)::numeric
      )::numeric, 3) as quantity,
      ri.unit_id,
      public.v3_category_to_department(r.category) as department
    from public.v3_event_menus em
    join public.v3_menus m on m.id = em.menu_id and m.hotel_id = p_hotel_id
    join public.v3_menu_sections ms on ms.menu_id = m.id and ms.hotel_id = p_hotel_id
    join public.v3_menu_section_recipes msr on msr.section_id = ms.id and msr.hotel_id = p_hotel_id
    join public.v3_recipes r on r.id = msr.recipe_id and r.hotel_id = p_hotel_id
    join public.v3_recipe_ingredients ri on ri.recipe_id = r.id and ri.hotel_id = p_hotel_id
    where em.hotel_id = p_hotel_id
      and em.event_id = p_event_id
      and r.status = 'approved'
      and ri.quantity_gross > 0
      and ri.product_id is not null
      and not exists (select 1 from existing_impact)
    group by ri.product_id, ri.unit_id, public.v3_category_to_department(r.category)
  ),
  impact_source as (
    select product_id, quantity, unit_id, department from existing_impact
    union all
    select product_id, quantity, unit_id, department from derived_impact
  )
  insert into public.v3_purchase_request_lines (
    hotel_id, purchase_request_id, product_id, quantity, unit_id, event_id, department, notes
  )
  select
    p_hotel_id,
    v_request_id,
    product_id,
    quantity,
    unit_id,
    p_event_id,
    department,
    'Auto-generada desde evento confirmado'
  from impact_source
  where quantity > 0;

  get diagnostics v_lines_created = row_count;

  if v_lines_created = 0 then
    delete from public.v3_purchase_requests
    where id = v_request_id
      and hotel_id = p_hotel_id;

    return jsonb_build_object(
      'purchase_request_id', null,
      'created', false,
      'lines_created', 0,
      'skipped_unmapped_lines', v_skipped_unmapped
    );
  end if;

  perform public.v3_emit_event(
    p_hotel_id,
    'purchase_request',
    v_request_id,
    'purchase_request.created',
    jsonb_build_object(
      'origin', 'event',
      'event_id', p_event_id,
      'line_count', v_lines_created,
      'skipped_unmapped_lines', v_skipped_unmapped
    )
  );

  return jsonb_build_object(
    'purchase_request_id', v_request_id,
    'created', true,
    'lines_created', v_lines_created,
    'skipped_unmapped_lines', v_skipped_unmapped
  );
end;
$$;

create or replace function public.v3_generate_purchase_requests_for_event(
  p_hotel_id uuid,
  p_event_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef','sous_chef','procurement','commercial']::public.v3_app_role[]
  );

  return public.v3_generate_purchase_requests_for_event_internal(p_hotel_id, p_event_id);
end;
$$;

create or replace function public.v3_cancel_purchase_requests_for_event_internal(
  p_hotel_id uuid,
  p_event_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cancelled_count integer := 0;
  v_skipped_count integer := 0;
  v_request record;
begin
  for v_request in
    update public.v3_purchase_requests
    set status = 'cancelled',
        cancel_reason = 'Evento cancelado',
        updated_at = now()
    where hotel_id = p_hotel_id
      and event_id = p_event_id
      and origin = 'event'
      and status in ('draft', 'approved')
    returning id
  loop
    v_cancelled_count := v_cancelled_count + 1;
    perform public.v3_emit_event(
      p_hotel_id,
      'purchase_request',
      v_request.id,
      'purchase_request.cancelled',
      jsonb_build_object('reason', 'Evento cancelado', 'event_id', p_event_id)
    );
  end loop;

  select count(*) into v_skipped_count
  from public.v3_purchase_requests
  where hotel_id = p_hotel_id
    and event_id = p_event_id
    and origin = 'event'
    and status = 'consolidated';

  return jsonb_build_object(
    'cancelled_purchase_requests', v_cancelled_count,
    'skipped_consolidated_purchase_requests', v_skipped_count
  );
end;
$$;

create or replace function public.v3_tg_procurement_event_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.aggregate_type = 'event' and new.event_type = 'event.confirmed' then
    perform public.v3_generate_purchase_requests_for_event_internal(new.hotel_id, new.aggregate_id);
  elsif new.aggregate_type = 'event' and new.event_type = 'event.cancelled' then
    perform public.v3_cancel_purchase_requests_for_event_internal(new.hotel_id, new.aggregate_id);
  end if;

  return new;
end;
$$;

drop trigger if exists v3_procurement_event_confirmed on public.v3_domain_events;
create trigger v3_procurement_event_confirmed
  after insert on public.v3_domain_events
  for each row
  when (
    new.aggregate_type = 'event'
    and new.event_type in ('event.confirmed', 'event.cancelled')
  )
  execute function public.v3_tg_procurement_event_confirmed();

-- ═══════════════════════════════════════════════════════════════════════════════
-- Grants
-- ═══════════════════════════════════════════════════════════════════════════════

revoke all on function public.v3_create_purchase_request(uuid, public.v3_pr_origin, date, uuid, text, jsonb) from public;
grant execute on function public.v3_create_purchase_request(uuid, public.v3_pr_origin, date, uuid, text, jsonb) to authenticated;

revoke all on function public.v3_transition_purchase_request(uuid, uuid, public.v3_pr_status, text) from public;
grant execute on function public.v3_transition_purchase_request(uuid, uuid, public.v3_pr_status, text) to authenticated;

revoke all on function public.v3_generate_purchase_order(uuid, uuid[]) from public;
grant execute on function public.v3_generate_purchase_order(uuid, uuid[]) to authenticated;

revoke all on function public.v3_transition_purchase_order(uuid, uuid, public.v3_po_status, text) from public;
grant execute on function public.v3_transition_purchase_order(uuid, uuid, public.v3_po_status, text) to authenticated;

revoke all on function public.v3_generate_purchase_requests_for_event(uuid, uuid) from public;
grant execute on function public.v3_generate_purchase_requests_for_event(uuid, uuid) to authenticated;

revoke all on function public.v3_generate_purchase_requests_for_event_internal(uuid, uuid) from public, anon, authenticated;
revoke all on function public.v3_cancel_purchase_requests_for_event_internal(uuid, uuid) from public, anon, authenticated;
revoke all on function public.v3_tg_procurement_event_confirmed() from public, anon, authenticated;
