-- 00082_v3_compliance_appcc.sql
-- Sprint-10 - Compliance APPCC / HACCP base controls.
-- ADR-0015: all v3-owned DB objects are prefixed with v3_.

do $enum_v3_compliance_equipment_type$
begin
  if not exists (select 1 from pg_type where typname = 'v3_compliance_equipment_type') then
    create type public.v3_compliance_equipment_type as enum (
      'fridge',
      'freezer',
      'blast_chiller',
      'hot_holding'
    );
  end if;
end $enum_v3_compliance_equipment_type$;

do $enum_v3_compliance_frequency$
begin
  if not exists (select 1 from pg_type where typname = 'v3_compliance_frequency') then
    create type public.v3_compliance_frequency as enum (
      'daily',
      'weekly',
      'monthly'
    );
  end if;
end $enum_v3_compliance_frequency$;

create table if not exists public.v3_compliance_quality_checks (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  goods_receipt_id uuid not null references public.v3_goods_receipts(id) on delete cascade,
  temperature_c numeric(6,2) null,
  temperature_ok boolean not null default true,
  packaging_ok boolean not null default true,
  expiry_ok boolean not null default true,
  all_ok boolean generated always as (temperature_ok and packaging_ok and expiry_ok) stored,
  notes text null,
  checked_by uuid not null references auth.users(id) on delete restrict,
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.v3_compliance_equipment (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  name text not null,
  equipment_type public.v3_compliance_equipment_type not null,
  location text null,
  min_temperature_c numeric(6,2) not null,
  max_temperature_c numeric(6,2) not null,
  is_active boolean not null default true,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint v3_compliance_equipment_name_check check (nullif(btrim(name), '') is not null),
  constraint v3_compliance_equipment_range_check check (min_temperature_c <= max_temperature_c)
);

create table if not exists public.v3_compliance_temperature_logs (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  equipment_id uuid not null references public.v3_compliance_equipment(id) on delete restrict,
  measured_at timestamptz not null default now(),
  measured_by uuid not null references auth.users(id) on delete restrict,
  temperature_c numeric(6,2) not null,
  min_temperature_c numeric(6,2) not null,
  max_temperature_c numeric(6,2) not null,
  in_range boolean generated always as (
    temperature_c >= min_temperature_c and temperature_c <= max_temperature_c
  ) stored,
  notes text null,
  created_at timestamptz not null default now(),
  constraint v3_compliance_temperature_range_check check (min_temperature_c <= max_temperature_c)
);

create table if not exists public.v3_compliance_cleaning_areas (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  name text not null,
  frequency public.v3_compliance_frequency not null default 'daily',
  description text null,
  is_active boolean not null default true,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint v3_compliance_cleaning_areas_name_check check (nullif(btrim(name), '') is not null)
);

create table if not exists public.v3_compliance_cleaning_checks (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  area_id uuid not null references public.v3_compliance_cleaning_areas(id) on delete restrict,
  due_date date not null,
  completed_at timestamptz not null default now(),
  completed_by uuid not null references auth.users(id) on delete restrict,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists v3_compliance_quality_checks_hotel_id_id_uidx
  on public.v3_compliance_quality_checks(hotel_id, id);

create unique index if not exists v3_compliance_quality_checks_gr_uidx
  on public.v3_compliance_quality_checks(hotel_id, goods_receipt_id);

create index if not exists v3_compliance_quality_checks_checked_idx
  on public.v3_compliance_quality_checks(hotel_id, checked_at desc);

create unique index if not exists v3_compliance_equipment_hotel_id_id_uidx
  on public.v3_compliance_equipment(hotel_id, id);

create index if not exists v3_compliance_equipment_type_idx
  on public.v3_compliance_equipment(hotel_id, equipment_type, is_active);

create unique index if not exists v3_compliance_temperature_logs_hotel_id_id_uidx
  on public.v3_compliance_temperature_logs(hotel_id, id);

create index if not exists v3_compliance_temperature_logs_equipment_measured_idx
  on public.v3_compliance_temperature_logs(hotel_id, equipment_id, measured_at desc);

create index if not exists v3_compliance_temperature_logs_out_of_range_idx
  on public.v3_compliance_temperature_logs(hotel_id, measured_at desc)
  where in_range = false;

create unique index if not exists v3_compliance_cleaning_areas_hotel_id_id_uidx
  on public.v3_compliance_cleaning_areas(hotel_id, id);

create index if not exists v3_compliance_cleaning_areas_frequency_idx
  on public.v3_compliance_cleaning_areas(hotel_id, frequency, is_active);

create unique index if not exists v3_compliance_cleaning_checks_hotel_id_id_uidx
  on public.v3_compliance_cleaning_checks(hotel_id, id);

create unique index if not exists v3_compliance_cleaning_checks_area_due_uidx
  on public.v3_compliance_cleaning_checks(hotel_id, area_id, due_date);

create index if not exists v3_compliance_cleaning_checks_due_idx
  on public.v3_compliance_cleaning_checks(hotel_id, due_date desc);

do $constraints_v3_compliance_tenant$
begin
  if not exists (select 1 from pg_constraint where conname = 'v3_compliance_quality_checks_gr_hotel_fkey') then
    alter table public.v3_compliance_quality_checks
      add constraint v3_compliance_quality_checks_gr_hotel_fkey
      foreign key (hotel_id, goods_receipt_id)
      references public.v3_goods_receipts(hotel_id, id)
      on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_compliance_temperature_logs_equipment_hotel_fkey') then
    alter table public.v3_compliance_temperature_logs
      add constraint v3_compliance_temperature_logs_equipment_hotel_fkey
      foreign key (hotel_id, equipment_id)
      references public.v3_compliance_equipment(hotel_id, id)
      on delete restrict;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'v3_compliance_cleaning_checks_area_hotel_fkey') then
    alter table public.v3_compliance_cleaning_checks
      add constraint v3_compliance_cleaning_checks_area_hotel_fkey
      foreign key (hotel_id, area_id)
      references public.v3_compliance_cleaning_areas(hotel_id, id)
      on delete restrict;
  end if;
end $constraints_v3_compliance_tenant$;

alter table public.v3_compliance_quality_checks enable row level security;
alter table public.v3_compliance_equipment enable row level security;
alter table public.v3_compliance_temperature_logs enable row level security;
alter table public.v3_compliance_cleaning_areas enable row level security;
alter table public.v3_compliance_cleaning_checks enable row level security;

drop policy if exists v3_compliance_quality_checks_select_members on public.v3_compliance_quality_checks;
create policy v3_compliance_quality_checks_select_members on public.v3_compliance_quality_checks
  for select using (public.v3_is_member_of(hotel_id));

drop policy if exists v3_compliance_quality_checks_insert_rpc_only on public.v3_compliance_quality_checks;
create policy v3_compliance_quality_checks_insert_rpc_only on public.v3_compliance_quality_checks
  for insert with check (false);

drop policy if exists v3_compliance_quality_checks_update_rpc_only on public.v3_compliance_quality_checks;
create policy v3_compliance_quality_checks_update_rpc_only on public.v3_compliance_quality_checks
  for update using (false) with check (false);

drop policy if exists v3_compliance_quality_checks_delete_rpc_only on public.v3_compliance_quality_checks;
create policy v3_compliance_quality_checks_delete_rpc_only on public.v3_compliance_quality_checks
  for delete using (false);

drop policy if exists v3_compliance_equipment_select_members on public.v3_compliance_equipment;
create policy v3_compliance_equipment_select_members on public.v3_compliance_equipment
  for select using (public.v3_is_member_of(hotel_id));

drop policy if exists v3_compliance_equipment_insert_roles on public.v3_compliance_equipment;
create policy v3_compliance_equipment_insert_roles on public.v3_compliance_equipment
  for insert with check (
    public.v3_get_member_role(hotel_id) in ('superadmin','direction','admin','head_chef')
  );

drop policy if exists v3_compliance_equipment_update_roles on public.v3_compliance_equipment;
create policy v3_compliance_equipment_update_roles on public.v3_compliance_equipment
  for update using (
    public.v3_get_member_role(hotel_id) in ('superadmin','direction','admin','head_chef')
  )
  with check (
    public.v3_get_member_role(hotel_id) in ('superadmin','direction','admin','head_chef')
  );

drop policy if exists v3_compliance_equipment_delete_never on public.v3_compliance_equipment;
create policy v3_compliance_equipment_delete_never on public.v3_compliance_equipment
  for delete using (false);

drop policy if exists v3_compliance_temperature_logs_select_members on public.v3_compliance_temperature_logs;
create policy v3_compliance_temperature_logs_select_members on public.v3_compliance_temperature_logs
  for select using (public.v3_is_member_of(hotel_id));

drop policy if exists v3_compliance_temperature_logs_insert_rpc_only on public.v3_compliance_temperature_logs;
create policy v3_compliance_temperature_logs_insert_rpc_only on public.v3_compliance_temperature_logs
  for insert with check (false);

drop policy if exists v3_compliance_temperature_logs_update_never on public.v3_compliance_temperature_logs;
create policy v3_compliance_temperature_logs_update_never on public.v3_compliance_temperature_logs
  for update using (false) with check (false);

drop policy if exists v3_compliance_temperature_logs_delete_never on public.v3_compliance_temperature_logs;
create policy v3_compliance_temperature_logs_delete_never on public.v3_compliance_temperature_logs
  for delete using (false);

drop policy if exists v3_compliance_cleaning_areas_select_members on public.v3_compliance_cleaning_areas;
create policy v3_compliance_cleaning_areas_select_members on public.v3_compliance_cleaning_areas
  for select using (public.v3_is_member_of(hotel_id));

drop policy if exists v3_compliance_cleaning_areas_insert_roles on public.v3_compliance_cleaning_areas;
create policy v3_compliance_cleaning_areas_insert_roles on public.v3_compliance_cleaning_areas
  for insert with check (
    public.v3_get_member_role(hotel_id) in ('superadmin','direction','admin','head_chef','sous_chef')
  );

drop policy if exists v3_compliance_cleaning_areas_update_roles on public.v3_compliance_cleaning_areas;
create policy v3_compliance_cleaning_areas_update_roles on public.v3_compliance_cleaning_areas
  for update using (
    public.v3_get_member_role(hotel_id) in ('superadmin','direction','admin','head_chef','sous_chef')
  )
  with check (
    public.v3_get_member_role(hotel_id) in ('superadmin','direction','admin','head_chef','sous_chef')
  );

drop policy if exists v3_compliance_cleaning_areas_delete_never on public.v3_compliance_cleaning_areas;
create policy v3_compliance_cleaning_areas_delete_never on public.v3_compliance_cleaning_areas
  for delete using (false);

drop policy if exists v3_compliance_cleaning_checks_select_members on public.v3_compliance_cleaning_checks;
create policy v3_compliance_cleaning_checks_select_members on public.v3_compliance_cleaning_checks
  for select using (public.v3_is_member_of(hotel_id));

drop policy if exists v3_compliance_cleaning_checks_insert_rpc_only on public.v3_compliance_cleaning_checks;
create policy v3_compliance_cleaning_checks_insert_rpc_only on public.v3_compliance_cleaning_checks
  for insert with check (false);

drop policy if exists v3_compliance_cleaning_checks_update_rpc_only on public.v3_compliance_cleaning_checks;
create policy v3_compliance_cleaning_checks_update_rpc_only on public.v3_compliance_cleaning_checks
  for update using (false) with check (false);

drop policy if exists v3_compliance_cleaning_checks_delete_never on public.v3_compliance_cleaning_checks;
create policy v3_compliance_cleaning_checks_delete_never on public.v3_compliance_cleaning_checks
  for delete using (false);

drop trigger if exists v3_compliance_quality_checks_set_updated_at on public.v3_compliance_quality_checks;
create trigger v3_compliance_quality_checks_set_updated_at
  before update on public.v3_compliance_quality_checks
  for each row
  execute function public.v3_tg_set_updated_at();

drop trigger if exists v3_compliance_equipment_set_updated_at on public.v3_compliance_equipment;
create trigger v3_compliance_equipment_set_updated_at
  before update on public.v3_compliance_equipment
  for each row
  execute function public.v3_tg_set_updated_at();

drop trigger if exists v3_compliance_cleaning_areas_set_updated_at on public.v3_compliance_cleaning_areas;
create trigger v3_compliance_cleaning_areas_set_updated_at
  before update on public.v3_compliance_cleaning_areas
  for each row
  execute function public.v3_tg_set_updated_at();

drop trigger if exists v3_compliance_cleaning_checks_set_updated_at on public.v3_compliance_cleaning_checks;
create trigger v3_compliance_cleaning_checks_set_updated_at
  before update on public.v3_compliance_cleaning_checks
  for each row
  execute function public.v3_tg_set_updated_at();

create or replace function public.v3_record_goods_receipt_quality_check(
  p_hotel_id uuid,
  p_goods_receipt_id uuid,
  p_temperature_c numeric default null,
  p_temperature_ok boolean default true,
  p_packaging_ok boolean default true,
  p_expiry_ok boolean default true,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_record_goods_receipt_quality_check$
declare
  v_goods_receipt_id uuid;
  v_check public.v3_compliance_quality_checks%rowtype;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef','sous_chef','procurement','warehouse']::public.v3_app_role[]
  );

  select id
    into v_goods_receipt_id
  from public.v3_goods_receipts
  where hotel_id = p_hotel_id
    and id = p_goods_receipt_id;

  if v_goods_receipt_id is null then
    raise exception 'goods receipt not found' using errcode = 'P0010';
  end if;

  insert into public.v3_compliance_quality_checks (
    hotel_id,
    goods_receipt_id,
    temperature_c,
    temperature_ok,
    packaging_ok,
    expiry_ok,
    notes,
    checked_by,
    checked_at
  )
  values (
    p_hotel_id,
    p_goods_receipt_id,
    p_temperature_c,
    coalesce(p_temperature_ok, true),
    coalesce(p_packaging_ok, true),
    coalesce(p_expiry_ok, true),
    nullif(btrim(coalesce(p_notes, '')), ''),
    auth.uid(),
    now()
  )
  on conflict (hotel_id, goods_receipt_id)
  do update set
    temperature_c = excluded.temperature_c,
    temperature_ok = excluded.temperature_ok,
    packaging_ok = excluded.packaging_ok,
    expiry_ok = excluded.expiry_ok,
    notes = excluded.notes,
    checked_by = excluded.checked_by,
    checked_at = excluded.checked_at,
    updated_at = now()
  returning * into v_check;

  perform public.v3_emit_event(
    p_hotel_id,
    'goods_receipt',
    p_goods_receipt_id,
    'compliance.quality_checked',
    jsonb_build_object(
      'quality_check_id', v_check.id,
      'all_ok', v_check.all_ok,
      'temperature_ok', v_check.temperature_ok,
      'packaging_ok', v_check.packaging_ok,
      'expiry_ok', v_check.expiry_ok
    )
  );

  return to_jsonb(v_check);
end;
$fn_v3_record_goods_receipt_quality_check$;

create or replace function public.v3_log_equipment_temperature(
  p_hotel_id uuid,
  p_equipment_id uuid,
  p_temperature_c numeric,
  p_measured_at timestamptz default now(),
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_log_equipment_temperature$
declare
  v_equipment public.v3_compliance_equipment%rowtype;
  v_log public.v3_compliance_temperature_logs%rowtype;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef','sous_chef','cook','warehouse']::public.v3_app_role[]
  );

  if p_temperature_c is null then
    raise exception 'temperature is required' using errcode = 'P0003';
  end if;

  select *
    into v_equipment
  from public.v3_compliance_equipment
  where hotel_id = p_hotel_id
    and id = p_equipment_id
    and is_active = true;

  if v_equipment.id is null then
    raise exception 'compliance equipment not found' using errcode = 'P0010';
  end if;

  insert into public.v3_compliance_temperature_logs (
    hotel_id,
    equipment_id,
    measured_at,
    measured_by,
    temperature_c,
    min_temperature_c,
    max_temperature_c,
    notes
  )
  values (
    p_hotel_id,
    p_equipment_id,
    coalesce(p_measured_at, now()),
    auth.uid(),
    p_temperature_c,
    v_equipment.min_temperature_c,
    v_equipment.max_temperature_c,
    nullif(btrim(coalesce(p_notes, '')), '')
  )
  returning * into v_log;

  perform public.v3_emit_event(
    p_hotel_id,
    'temperature',
    v_log.id,
    'temperature.logged',
    jsonb_build_object(
      'equipment_id', p_equipment_id,
      'temperature_c', v_log.temperature_c,
      'in_range', v_log.in_range
    )
  );

  if v_log.in_range = false then
    perform public.v3_emit_event(
      p_hotel_id,
      'temperature',
      v_log.id,
      'temperature.out_of_range',
      jsonb_build_object(
        'equipment_id', p_equipment_id,
        'temperature_c', v_log.temperature_c,
        'min_temperature_c', v_log.min_temperature_c,
        'max_temperature_c', v_log.max_temperature_c
      )
    );
  end if;

  return to_jsonb(v_log) || jsonb_build_object(
    'equipment_name', v_equipment.name,
    'equipment_type', v_equipment.equipment_type
  );
end;
$fn_v3_log_equipment_temperature$;

create or replace function public.v3_complete_cleaning_check(
  p_hotel_id uuid,
  p_area_id uuid,
  p_due_date date default current_date,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_complete_cleaning_check$
declare
  v_area public.v3_compliance_cleaning_areas%rowtype;
  v_check public.v3_compliance_cleaning_checks%rowtype;
begin
  perform public.v3_check_membership(
    auth.uid(),
    p_hotel_id,
    array['superadmin','direction','admin','head_chef','sous_chef','cook','warehouse']::public.v3_app_role[]
  );

  select *
    into v_area
  from public.v3_compliance_cleaning_areas
  where hotel_id = p_hotel_id
    and id = p_area_id
    and is_active = true;

  if v_area.id is null then
    raise exception 'cleaning area not found' using errcode = 'P0010';
  end if;

  insert into public.v3_compliance_cleaning_checks (
    hotel_id,
    area_id,
    due_date,
    completed_at,
    completed_by,
    notes
  )
  values (
    p_hotel_id,
    p_area_id,
    coalesce(p_due_date, current_date),
    now(),
    auth.uid(),
    nullif(btrim(coalesce(p_notes, '')), '')
  )
  on conflict (hotel_id, area_id, due_date)
  do update set
    completed_at = excluded.completed_at,
    completed_by = excluded.completed_by,
    notes = excluded.notes,
    updated_at = now()
  returning * into v_check;

  perform public.v3_emit_event(
    p_hotel_id,
    'cleaning_area',
    p_area_id,
    'compliance.cleaning_completed',
    jsonb_build_object(
      'cleaning_check_id', v_check.id,
      'due_date', v_check.due_date,
      'frequency', v_area.frequency
    )
  );

  return to_jsonb(v_check) || jsonb_build_object(
    'area_name', v_area.name,
    'frequency', v_area.frequency
  );
end;
$fn_v3_complete_cleaning_check$;

create or replace function public.v3_get_compliance_overview(
  p_hotel_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_get_compliance_overview$
declare
  v_quality jsonb;
  v_temperature jsonb;
  v_cleaning jsonb;
begin
  perform public.v3_check_membership(auth.uid(), p_hotel_id, null);

  select jsonb_build_object(
    'pending_goods_receipts', coalesce(count(gr.id) filter (where qc.id is null), 0),
    'failed_checks_30d', coalesce(count(qc.id) filter (where qc.all_ok = false), 0),
    'latest_failed', coalesce(jsonb_agg(jsonb_build_object(
      'id', qc.id,
      'goods_receipt_id', qc.goods_receipt_id,
      'checked_at', qc.checked_at,
      'temperature_ok', qc.temperature_ok,
      'packaging_ok', qc.packaging_ok,
      'expiry_ok', qc.expiry_ok
    ) order by qc.checked_at desc) filter (where qc.all_ok = false), '[]'::jsonb)
  )
    into v_quality
  from public.v3_goods_receipts gr
  left join public.v3_compliance_quality_checks qc
    on qc.hotel_id = p_hotel_id
   and qc.goods_receipt_id = gr.id
  where gr.hotel_id = p_hotel_id
    and gr.received_at >= now() - interval '30 days';

  select jsonb_build_object(
    'equipment_active', coalesce((select count(*) from public.v3_compliance_equipment e where e.hotel_id = p_hotel_id and e.is_active), 0),
    'out_of_range_24h', coalesce(count(tl.id) filter (where tl.in_range = false), 0),
    'latest_out_of_range', coalesce(jsonb_agg(jsonb_build_object(
      'id', tl.id,
      'equipment_id', tl.equipment_id,
      'equipment_name', e.name,
      'equipment_type', e.equipment_type,
      'temperature_c', tl.temperature_c,
      'min_temperature_c', tl.min_temperature_c,
      'max_temperature_c', tl.max_temperature_c,
      'measured_at', tl.measured_at
    ) order by tl.measured_at desc) filter (where tl.in_range = false), '[]'::jsonb)
  )
    into v_temperature
  from public.v3_compliance_temperature_logs tl
  join public.v3_compliance_equipment e
    on e.id = tl.equipment_id
   and e.hotel_id = p_hotel_id
  where tl.hotel_id = p_hotel_id
    and tl.measured_at >= now() - interval '24 hours';

  with due_areas as (
    select
      a.id,
      a.name,
      a.frequency,
      case a.frequency
        when 'daily' then current_date
        when 'weekly' then date_trunc('week', current_date)::date
        when 'monthly' then date_trunc('month', current_date)::date
      end as due_date
    from public.v3_compliance_cleaning_areas a
    where a.hotel_id = p_hotel_id
      and a.is_active = true
  )
  select jsonb_build_object(
    'areas_active', coalesce(count(da.id), 0),
    'completed_due', coalesce(count(cc.id), 0),
    'pending_due', coalesce(count(da.id) filter (where cc.id is null), 0),
    'pending', coalesce(jsonb_agg(jsonb_build_object(
      'area_id', da.id,
      'area_name', da.name,
      'frequency', da.frequency,
      'due_date', da.due_date
    ) order by da.frequency, da.name) filter (where cc.id is null), '[]'::jsonb)
  )
    into v_cleaning
  from due_areas da
  left join public.v3_compliance_cleaning_checks cc
    on cc.hotel_id = p_hotel_id
   and cc.area_id = da.id
   and cc.due_date = da.due_date;

  return jsonb_build_object(
    'quality', coalesce(v_quality, '{}'::jsonb),
    'temperature', coalesce(v_temperature, '{}'::jsonb),
    'cleaning', coalesce(v_cleaning, '{}'::jsonb)
  );
end;
$fn_v3_get_compliance_overview$;

create or replace function public.v3_trace_lot(
  p_hotel_id uuid,
  p_lot_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn_v3_trace_lot$
declare
  v_lot record;
  v_goods_receipt jsonb := null;
  v_purchase_order jsonb := null;
  v_supplier jsonb := null;
  v_production jsonb := null;
  v_movements jsonb := '[]'::jsonb;
  v_consumed_in_recipes jsonb := '[]'::jsonb;
begin
  perform public.v3_check_membership(auth.uid(), p_hotel_id, null);

  select
    lot.*,
    p.name as product_name,
    p.category_id,
    u.name as unit_name,
    u.abbreviation as unit_abbreviation
    into v_lot
  from public.v3_inventory_lots lot
  join public.v3_products p
    on p.id = lot.product_id
   and p.hotel_id = p_hotel_id
  join public.v3_units_of_measure u
    on u.id = lot.unit_id
   and u.hotel_id = p_hotel_id
  where lot.hotel_id = p_hotel_id
    and lot.id = p_lot_id;

  if v_lot.id is null then
    raise exception 'inventory lot not found' using errcode = 'P0010';
  end if;

  if v_lot.goods_receipt_line_id is not null then
    select to_jsonb(gr) || jsonb_build_object(
      'line', to_jsonb(grl),
      'quality_check', to_jsonb(qc)
    )
      into v_goods_receipt
    from public.v3_goods_receipt_lines grl
    join public.v3_goods_receipts gr
      on gr.id = grl.goods_receipt_id
     and gr.hotel_id = p_hotel_id
    left join public.v3_compliance_quality_checks qc
      on qc.hotel_id = p_hotel_id
     and qc.goods_receipt_id = gr.id
    where grl.hotel_id = p_hotel_id
      and grl.id = v_lot.goods_receipt_line_id;

    select to_jsonb(po) || jsonb_build_object('line', to_jsonb(pol))
      into v_purchase_order
    from public.v3_goods_receipt_lines grl
    join public.v3_purchase_order_lines pol
      on pol.id = grl.purchase_order_line_id
     and pol.hotel_id = p_hotel_id
    join public.v3_purchase_orders po
      on po.id = pol.purchase_order_id
     and po.hotel_id = p_hotel_id
    where grl.hotel_id = p_hotel_id
      and grl.id = v_lot.goods_receipt_line_id;

    select to_jsonb(s)
      into v_supplier
    from public.v3_goods_receipt_lines grl
    join public.v3_purchase_order_lines pol
      on pol.id = grl.purchase_order_line_id
     and pol.hotel_id = p_hotel_id
    join public.v3_purchase_orders po
      on po.id = pol.purchase_order_id
     and po.hotel_id = p_hotel_id
    join public.v3_suppliers s
      on s.id = po.supplier_id
     and s.hotel_id = p_hotel_id
    where grl.hotel_id = p_hotel_id
      and grl.id = v_lot.goods_receipt_line_id;
  end if;

  if v_lot.production_order_id is not null then
    select to_jsonb(po) || jsonb_build_object('recipe_name', r.name)
      into v_production
    from public.v3_production_orders po
    join public.v3_recipes r
      on r.id = po.recipe_id
     and r.hotel_id = p_hotel_id
    where po.hotel_id = p_hotel_id
      and po.id = v_lot.production_order_id;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', m.id,
    'kind', m.kind,
    'quantity', m.quantity,
    'unit_cost', m.unit_cost,
    'total_cost', m.total_cost,
    'origin', m.origin,
    'notes', m.notes,
    'created_at', m.created_at
  ) order by m.created_at asc, m.id asc), '[]'::jsonb)
    into v_movements
  from public.v3_inventory_movements m
  where m.hotel_id = p_hotel_id
    and m.lot_id = p_lot_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'recipe_id', r.id,
    'recipe_name', r.name,
    'production_order_id', po.id,
    'movement_id', m.id,
    'quantity', m.quantity,
    'total_cost', m.total_cost,
    'consumed_at', m.created_at
  ) order by m.created_at asc, m.id asc), '[]'::jsonb)
    into v_consumed_in_recipes
  from public.v3_inventory_movements m
  left join public.v3_production_orders po
    on po.hotel_id = p_hotel_id
   and po.id::text = m.origin ->> 'production_order_id'
  left join public.v3_recipes r
    on r.hotel_id = p_hotel_id
   and r.id = coalesce(m.recipe_id, po.recipe_id)
  where m.hotel_id = p_hotel_id
    and m.lot_id = p_lot_id
    and m.kind = 'consume'
    and r.id is not null;

  perform public.v3_emit_event(
    p_hotel_id,
    'lot',
    p_lot_id,
    'lot.traced',
    jsonb_build_object('product_id', v_lot.product_id),
    0
  );

  return jsonb_build_object(
    'lot', jsonb_build_object(
      'id', v_lot.id,
      'hotel_id', v_lot.hotel_id,
      'product_id', v_lot.product_id,
      'product_name', v_lot.product_name,
      'category_id', v_lot.category_id,
      'quantity_received', v_lot.quantity_received,
      'quantity_remaining', v_lot.quantity_remaining,
      'unit_id', v_lot.unit_id,
      'unit_name', v_lot.unit_name,
      'unit_abbreviation', v_lot.unit_abbreviation,
      'unit_cost', v_lot.unit_cost,
      'received_at', v_lot.received_at,
      'expires_at', v_lot.expires_at,
      'is_preparation', coalesce(v_lot.is_preparation, false),
      'production_order_id', v_lot.production_order_id,
      'goods_receipt_line_id', v_lot.goods_receipt_line_id
    ),
    'goods_receipt', v_goods_receipt,
    'purchase_order', v_purchase_order,
    'supplier', v_supplier,
    'production', v_production,
    'movements', coalesce(v_movements, '[]'::jsonb),
    'consumed_in_recipes', coalesce(v_consumed_in_recipes, '[]'::jsonb)
  );
end;
$fn_v3_trace_lot$;

revoke all on function public.v3_record_goods_receipt_quality_check(uuid, uuid, numeric, boolean, boolean, boolean, text) from public, anon, authenticated;
grant execute on function public.v3_record_goods_receipt_quality_check(uuid, uuid, numeric, boolean, boolean, boolean, text) to authenticated;

revoke all on function public.v3_log_equipment_temperature(uuid, uuid, numeric, timestamptz, text) from public, anon, authenticated;
grant execute on function public.v3_log_equipment_temperature(uuid, uuid, numeric, timestamptz, text) to authenticated;

revoke all on function public.v3_complete_cleaning_check(uuid, uuid, date, text) from public, anon, authenticated;
grant execute on function public.v3_complete_cleaning_check(uuid, uuid, date, text) to authenticated;

revoke all on function public.v3_get_compliance_overview(uuid) from public, anon, authenticated;
grant execute on function public.v3_get_compliance_overview(uuid) to authenticated;

revoke all on function public.v3_trace_lot(uuid, uuid) from public, anon, authenticated;
grant execute on function public.v3_trace_lot(uuid, uuid) to authenticated;
