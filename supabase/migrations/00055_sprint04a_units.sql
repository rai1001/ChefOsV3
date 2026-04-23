-- Sprint-04a · módulo `catalog` · units (global) + conversions + hotel overrides
-- ADR-0014 (decisions-log). Sub-sprint 04a del módulo catalog.
--
-- ⚠️  DEPRECADA 2026-04-23 (ver 00056_sprint04a_rollback_and_mapping.sql).
-- Se descubrió tras aplicar que v2 ya tiene `units_of_measure` (per-hotel, con
-- `conversion_factor` y `base_unit_id` self-ref) y toda la capa catalog.
-- Esta migración creó tablas huérfanas que se droppean en 00056.
-- pg_trgm sí se mantiene (se sigue usando en 00056).
-- Se conserva este archivo por trazabilidad histórica.
--
-- Aplicar en Supabase Dashboard → SQL editor → Run.

begin;

-- ─── 1. Extensión pg_trgm (búsqueda fuzzy — necesaria en 00056/00057) ────────

create extension if not exists pg_trgm;

-- ─── 2. Enum kind de unidad ──────────────────────────────────────────────────

do $enum_unit_kind$ begin
  create type public.unit_kind as enum ('mass', 'volume', 'count');
exception when duplicate_object then null; end $enum_unit_kind$;

-- ─── 3. Tabla units (global, sin hotel_id) ───────────────────────────────────

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = lower(code) and char_length(code) between 1 and 32),
  name text not null check (char_length(name) between 1 and 64),
  abbreviation text not null check (char_length(abbreviation) between 1 and 16),
  kind public.unit_kind not null,
  is_base boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists units_kind_idx on public.units (kind);

-- Seed catálogo global. ON CONFLICT DO NOTHING por si la migración se re-aplica.
insert into public.units (code, name, abbreviation, kind, is_base) values
  ('g',            'gramo',       'g',    'mass',   true),
  ('kg',           'kilogramo',   'kg',   'mass',   false),
  ('ml',           'mililitro',   'ml',   'volume', true),
  ('l',            'litro',       'l',    'volume', false),
  ('ud',           'unidad',      'ud',   'count',  true),
  ('caja',         'caja',        'caja', 'count',  false),
  ('docena',       'docena',      'doc',  'count',  false),
  ('cucharada',    'cucharada',   'cda',  'volume', false),
  ('cucharadita',  'cucharadita', 'cdta', 'volume', false)
on conflict (code) do nothing;

-- ─── 4. Tabla unit_conversions ───────────────────────────────────────────────
--
-- Conversión lineal: value_in_to = value_in_from * factor.
-- Solo se permiten conversiones dentro del mismo `kind` (validado por CHECK +
-- trigger al final). unit_conversions no depende del hotel; es global.

create table if not exists public.unit_conversions (
  id uuid primary key default gen_random_uuid(),
  from_unit_id uuid not null references public.units(id) on delete cascade,
  to_unit_id uuid not null references public.units(id) on delete cascade,
  factor numeric(20, 8) not null check (factor > 0),
  created_at timestamptz not null default now(),
  constraint unit_conversions_unique_pair unique (from_unit_id, to_unit_id),
  constraint unit_conversions_not_self check (from_unit_id <> to_unit_id)
);

create index if not exists unit_conversions_from_idx on public.unit_conversions (from_unit_id);
create index if not exists unit_conversions_to_idx on public.unit_conversions (to_unit_id);

-- Trigger que valida que from.kind = to.kind (no se puede convertir mass ↔ volume).
create or replace function public.tg_unit_conversions_same_kind()
returns trigger
language plpgsql
as $fn_same_kind$
declare
  v_from_kind public.unit_kind;
  v_to_kind public.unit_kind;
begin
  select kind into v_from_kind from public.units where id = new.from_unit_id;
  select kind into v_to_kind from public.units where id = new.to_unit_id;
  if v_from_kind is distinct from v_to_kind then
    raise exception 'unit_conversions: from (%) and to (%) must share kind', v_from_kind, v_to_kind
      using errcode = '22023';
  end if;
  return new;
end;
$fn_same_kind$;

drop trigger if exists unit_conversions_same_kind on public.unit_conversions;
create trigger unit_conversions_same_kind
  before insert or update on public.unit_conversions
  for each row execute function public.tg_unit_conversions_same_kind();

-- Seed conversiones básicas (g↔kg, ml↔l).
-- Usar subqueries por code para evitar ambigüedad de alias (g, kg, ml, l).
insert into public.unit_conversions (from_unit_id, to_unit_id, factor)
values
  ((select id from public.units where code = 'g'),  (select id from public.units where code = 'kg'), 0.001),
  ((select id from public.units where code = 'kg'), (select id from public.units where code = 'g'),  1000),
  ((select id from public.units where code = 'ml'), (select id from public.units where code = 'l'),  0.001),
  ((select id from public.units where code = 'l'),  (select id from public.units where code = 'ml'), 1000)
on conflict (from_unit_id, to_unit_id) do nothing;

-- ─── 5. Tabla hotel_unit_overrides ───────────────────────────────────────────
--
-- Un hotel puede redefinir el nombre/abreviatura de una unidad global.
-- No permite redefinir kind ni factor (eso rompería semántica).

create table if not exists public.hotel_unit_overrides (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,
  override_name text null check (override_name is null or char_length(override_name) between 1 and 64),
  override_abbreviation text null check (override_abbreviation is null or char_length(override_abbreviation) between 1 and 16),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hotel_unit_overrides_unique unique (hotel_id, unit_id),
  constraint hotel_unit_overrides_has_override check (
    override_name is not null or override_abbreviation is not null
  )
);

create index if not exists hotel_unit_overrides_hotel_idx on public.hotel_unit_overrides (hotel_id);

-- ─── 6. RLS ──────────────────────────────────────────────────────────────────

-- units y unit_conversions: lectura autenticada (catálogo global compartido).
alter table public.units enable row level security;
alter table public.unit_conversions enable row level security;

drop policy if exists "units_select_authenticated" on public.units;
create policy "units_select_authenticated"
  on public.units
  for select
  to authenticated
  using (true);

drop policy if exists "unit_conversions_select_authenticated" on public.unit_conversions;
create policy "unit_conversions_select_authenticated"
  on public.unit_conversions
  for select
  to authenticated
  using (true);

-- Insert/update/delete de units y unit_conversions: solo via migración (sin policy).

-- hotel_unit_overrides: scoped por hotel con rol admin/direction/superadmin.
alter table public.hotel_unit_overrides enable row level security;

drop policy if exists "hotel_unit_overrides_select_members" on public.hotel_unit_overrides;
create policy "hotel_unit_overrides_select_members"
  on public.hotel_unit_overrides
  for select
  using (public.is_member_of(hotel_id));

drop policy if exists "hotel_unit_overrides_insert_admin" on public.hotel_unit_overrides;
create policy "hotel_unit_overrides_insert_admin"
  on public.hotel_unit_overrides
  for insert
  with check (
    public.is_member_of(hotel_id)
    and public.get_member_role(hotel_id) in ('superadmin', 'direction', 'admin')
    and created_by = auth.uid()
  );

drop policy if exists "hotel_unit_overrides_update_admin" on public.hotel_unit_overrides;
create policy "hotel_unit_overrides_update_admin"
  on public.hotel_unit_overrides
  for update
  using (
    public.is_member_of(hotel_id)
    and public.get_member_role(hotel_id) in ('superadmin', 'direction', 'admin')
  )
  with check (
    public.is_member_of(hotel_id)
    and public.get_member_role(hotel_id) in ('superadmin', 'direction', 'admin')
  );

drop policy if exists "hotel_unit_overrides_delete_admin" on public.hotel_unit_overrides;
create policy "hotel_unit_overrides_delete_admin"
  on public.hotel_unit_overrides
  for delete
  using (
    public.is_member_of(hotel_id)
    and public.get_member_role(hotel_id) in ('superadmin', 'direction', 'admin')
  );

commit;
