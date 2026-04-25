-- 00060_v3_tables_and_fks.sql
-- ADR-0015 Fase 1 DB: crea 31 tablas v3_* con schema copiado de v2 (LIKE INCLUDING ALL)
-- + conversión de columnas enum a v3_* + FKs a v3_* / auth.users + RLS enable.
-- Las policies RLS se crean en 00061 junto a los helpers v3_is_member_of / v3_get_member_role.
-- Idempotente: cada tabla drop if exists cascade antes del create.
--
-- FKs:
--  * v3_X.hotel_id, v3_X.tenant_id, v3_X.event_id, etc. → v3_*.
--  * FK a auth.users se mantiene (users es global Supabase).
--  * FK v3_products.category_id → v3_product_categories (nueva, v2 NO tiene product_categories).
--  * FK v3_supplier_incidents.purchase_order_id OMITIDA (v3_purchase_orders pendiente sprint-05).

-- ═══════════════════════════════════════════════════════════════════════════════
-- NIVEL 0 — sin FK a otras tablas v3_
-- ═══════════════════════════════════════════════════════════════════════════════

drop table if exists public.v3_tenants cascade;
create table public.v3_tenants (like public.tenants including all);
alter table public.v3_tenants enable row level security;

-- ═══════════════════════════════════════════════════════════════════════════════
-- NIVEL 1 — FK → v3_tenants / auth.users
-- ═══════════════════════════════════════════════════════════════════════════════

drop table if exists public.v3_hotels cascade;
create table public.v3_hotels (like public.hotels including all);
alter table public.v3_hotels
  add constraint v3_hotels_tenant_id_fkey foreign key (tenant_id)
    references public.v3_tenants(id) on delete cascade;
alter table public.v3_hotels enable row level security;

drop table if exists public.v3_profiles cascade;
create table public.v3_profiles (like public.profiles including all);
alter table public.v3_profiles
  add constraint v3_profiles_id_fkey foreign key (id)
    references auth.users(id) on delete cascade;
alter table public.v3_profiles enable row level security;

-- ═══════════════════════════════════════════════════════════════════════════════
-- NIVEL 2 — FK → v3_hotels / v3_tenants / auth.users
-- ═══════════════════════════════════════════════════════════════════════════════

drop table if exists public.v3_memberships cascade;
create table public.v3_memberships (like public.memberships including all);
alter table public.v3_memberships
  alter column role type public.v3_app_role using role::text::public.v3_app_role;
-- memberships.role no tiene default
alter table public.v3_memberships
  add constraint v3_memberships_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade,
  add constraint v3_memberships_tenant_id_fkey foreign key (tenant_id)
    references public.v3_tenants(id) on delete cascade,
  add constraint v3_memberships_user_id_fkey foreign key (user_id)
    references auth.users(id) on delete cascade;
alter table public.v3_memberships enable row level security;

-- v3_invites: explícito (el origen v2 se dropeó en 00058)
drop table if exists public.v3_invites cascade;
create table public.v3_invites (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  tenant_id uuid not null references public.v3_tenants(id) on delete cascade,
  email text not null check (char_length(email) between 3 and 255),
  role public.v3_app_role not null,
  token_hash text not null unique,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  accepted_at timestamptz null,
  accepted_by uuid null references auth.users(id) on delete set null,
  revoked_at timestamptz null,
  constraint v3_invites_email_lowercase check (email = lower(email)),
  constraint v3_invites_not_both_accepted_and_revoked check (
    not (accepted_at is not null and revoked_at is not null)
  )
);
create unique index if not exists v3_invites_pending_unique
  on public.v3_invites (hotel_id, email)
  where accepted_at is null and revoked_at is null;
create index if not exists v3_invites_hotel_id_idx on public.v3_invites (hotel_id);
create index if not exists v3_invites_tenant_id_idx on public.v3_invites (tenant_id);
create index if not exists v3_invites_email_idx on public.v3_invites (email);
alter table public.v3_invites enable row level security;

drop table if exists public.v3_clients cascade;
create table public.v3_clients (like public.clients including all);
alter table public.v3_clients alter column vip_level drop default;
alter table public.v3_clients
  alter column vip_level type public.v3_vip_level using vip_level::text::public.v3_vip_level;
alter table public.v3_clients alter column vip_level set default 'standard'::public.v3_vip_level;
alter table public.v3_clients
  add constraint v3_clients_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade;
alter table public.v3_clients enable row level security;

drop table if exists public.v3_units_of_measure cascade;
create table public.v3_units_of_measure (like public.units_of_measure including all);
alter table public.v3_units_of_measure
  alter column unit_type type public.v3_unit_type using unit_type::text::public.v3_unit_type;
alter table public.v3_units_of_measure
  add constraint v3_units_of_measure_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade,
  add constraint v3_units_of_measure_base_unit_id_fkey foreign key (base_unit_id)
    references public.v3_units_of_measure(id) on delete set null;
alter table public.v3_units_of_measure enable row level security;

-- v3_product_categories: NUEVA (v2 no la tiene)
drop table if exists public.v3_product_categories cascade;
create table public.v3_product_categories (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (hotel_id, name)
);
create index if not exists v3_product_categories_hotel_id_idx on public.v3_product_categories (hotel_id);
alter table public.v3_product_categories enable row level security;

drop table if exists public.v3_suppliers cascade;
create table public.v3_suppliers (like public.suppliers including all);
alter table public.v3_suppliers
  add constraint v3_suppliers_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade;
alter table public.v3_suppliers enable row level security;

drop table if exists public.v3_menus cascade;
create table public.v3_menus (like public.menus including all);
alter table public.v3_menus alter column menu_type drop default;
alter table public.v3_menus
  alter column menu_type type public.v3_menu_type using menu_type::text::public.v3_menu_type;
alter table public.v3_menus alter column menu_type set default 'seated'::public.v3_menu_type;
alter table public.v3_menus
  add constraint v3_menus_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade;
alter table public.v3_menus enable row level security;

drop table if exists public.v3_audit_logs cascade;
create table public.v3_audit_logs (like public.audit_logs including all);
alter table public.v3_audit_logs
  add constraint v3_audit_logs_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade;
alter table public.v3_audit_logs enable row level security;

drop table if exists public.v3_domain_events cascade;
create table public.v3_domain_events (like public.domain_events including all);
alter table public.v3_domain_events
  add constraint v3_domain_events_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade;
alter table public.v3_domain_events enable row level security;

-- v3_import_runs: explícito (origen v2 dropeado en 00058)
drop table if exists public.v3_import_runs cascade;
create table public.v3_import_runs (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.v3_hotels(id) on delete cascade,
  kind public.v3_import_kind not null,
  status public.v3_import_status not null default 'pending',
  total_rows int not null default 0 check (total_rows >= 0),
  ok_rows int not null default 0 check (ok_rows >= 0),
  failed_rows int not null default 0 check (failed_rows >= 0),
  errors jsonb not null default '[]'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  started_at timestamptz not null default now(),
  finished_at timestamptz null
);
create index if not exists v3_import_runs_hotel_id_idx on public.v3_import_runs (hotel_id);
create index if not exists v3_import_runs_kind_idx on public.v3_import_runs (kind);
create index if not exists v3_import_runs_started_at_idx on public.v3_import_runs (started_at desc);
alter table public.v3_import_runs enable row level security;

-- ═══════════════════════════════════════════════════════════════════════════════
-- NIVEL 3 — FK → v3_clients / v3_units / v3_product_categories / auth.users
-- ═══════════════════════════════════════════════════════════════════════════════

drop table if exists public.v3_events cascade;
create table public.v3_events (like public.events including all);
alter table public.v3_events
  alter column service_type drop default,
  alter column status drop default;
alter table public.v3_events
  alter column event_type type public.v3_event_type using event_type::text::public.v3_event_type,
  alter column service_type type public.v3_service_type using service_type::text::public.v3_service_type,
  alter column status type public.v3_event_status using status::text::public.v3_event_status;
alter table public.v3_events
  alter column service_type set default 'seated'::public.v3_service_type,
  alter column status set default 'draft'::public.v3_event_status;
alter table public.v3_events
  add constraint v3_events_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade,
  add constraint v3_events_client_id_fkey foreign key (client_id)
    references public.v3_clients(id) on delete set null,
  add constraint v3_events_created_by_fkey foreign key (created_by)
    references auth.users(id) on delete no action;
alter table public.v3_events enable row level security;

drop table if exists public.v3_products cascade;
create table public.v3_products (like public.products including all);
alter table public.v3_products alter column storage_type drop default;
alter table public.v3_products
  alter column storage_type type public.v3_storage_type using storage_type::text::public.v3_storage_type;
alter table public.v3_products alter column storage_type set default 'ambient'::public.v3_storage_type;
alter table public.v3_products
  add constraint v3_products_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade,
  add constraint v3_products_default_unit_id_fkey foreign key (default_unit_id)
    references public.v3_units_of_measure(id) on delete set null,
  add constraint v3_products_category_id_fkey foreign key (category_id)
    references public.v3_product_categories(id) on delete set null;
alter table public.v3_products enable row level security;

drop table if exists public.v3_recipes cascade;
create table public.v3_recipes (like public.recipes including all);
alter table public.v3_recipes
  alter column difficulty drop default,
  alter column status drop default;
alter table public.v3_recipes
  alter column category type public.v3_recipe_category using category::text::public.v3_recipe_category,
  alter column difficulty type public.v3_recipe_difficulty using difficulty::text::public.v3_recipe_difficulty,
  alter column status type public.v3_recipe_status using status::text::public.v3_recipe_status;
alter table public.v3_recipes
  alter column difficulty set default 'medium'::public.v3_recipe_difficulty,
  alter column status set default 'draft'::public.v3_recipe_status;
alter table public.v3_recipes
  add constraint v3_recipes_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade,
  add constraint v3_recipes_yield_unit_id_fkey foreign key (yield_unit_id)
    references public.v3_units_of_measure(id) on delete set null;
alter table public.v3_recipes enable row level security;

-- ═══════════════════════════════════════════════════════════════════════════════
-- NIVEL 4 — FK → v3_events / v3_products / v3_suppliers / v3_recipes / v3_menus
-- ═══════════════════════════════════════════════════════════════════════════════

drop table if exists public.v3_event_spaces cascade;
create table public.v3_event_spaces (like public.event_spaces including all);
alter table public.v3_event_spaces
  add constraint v3_event_spaces_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade,
  add constraint v3_event_spaces_event_id_fkey foreign key (event_id)
    references public.v3_events(id) on delete cascade;
alter table public.v3_event_spaces enable row level security;

drop table if exists public.v3_event_menus cascade;
create table public.v3_event_menus (like public.event_menus including all);
alter table public.v3_event_menus
  add constraint v3_event_menus_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade,
  add constraint v3_event_menus_event_id_fkey foreign key (event_id)
    references public.v3_events(id) on delete cascade;
alter table public.v3_event_menus enable row level security;

drop table if exists public.v3_event_operational_impact cascade;
create table public.v3_event_operational_impact (like public.event_operational_impact including all);
alter table public.v3_event_operational_impact alter column department drop default;
alter table public.v3_event_operational_impact
  alter column department type public.v3_department using department::text::public.v3_department;
alter table public.v3_event_operational_impact alter column department set default 'general'::public.v3_department;
alter table public.v3_event_operational_impact
  add constraint v3_event_operational_impact_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade,
  add constraint v3_event_operational_impact_event_id_fkey foreign key (event_id)
    references public.v3_events(id) on delete cascade,
  add constraint v3_event_operational_impact_product_id_fkey foreign key (product_id)
    references public.v3_products(id) on delete set null;
alter table public.v3_event_operational_impact enable row level security;

drop table if exists public.v3_event_versions cascade;
create table public.v3_event_versions (like public.event_versions including all);
alter table public.v3_event_versions
  add constraint v3_event_versions_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade,
  add constraint v3_event_versions_event_id_fkey foreign key (event_id)
    references public.v3_events(id) on delete cascade,
  add constraint v3_event_versions_changed_by_fkey foreign key (changed_by)
    references auth.users(id) on delete no action;
alter table public.v3_event_versions enable row level security;

drop table if exists public.v3_product_aliases cascade;
create table public.v3_product_aliases (like public.product_aliases including all);
alter table public.v3_product_aliases alter column source_type drop default;
alter table public.v3_product_aliases
  alter column source_type type public.v3_alias_source using source_type::text::public.v3_alias_source;
alter table public.v3_product_aliases alter column source_type set default 'manual'::public.v3_alias_source;
alter table public.v3_product_aliases
  add constraint v3_product_aliases_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade,
  add constraint v3_product_aliases_product_id_fkey foreign key (product_id)
    references public.v3_products(id) on delete cascade;
alter table public.v3_product_aliases enable row level security;

drop table if exists public.v3_supplier_configs cascade;
create table public.v3_supplier_configs (like public.supplier_configs including all);
alter table public.v3_supplier_configs
  add constraint v3_supplier_configs_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade,
  add constraint v3_supplier_configs_supplier_id_fkey foreign key (supplier_id)
    references public.v3_suppliers(id) on delete cascade;
alter table public.v3_supplier_configs enable row level security;

drop table if exists public.v3_supplier_offers cascade;
create table public.v3_supplier_offers (like public.supplier_offers including all);
alter table public.v3_supplier_offers
  add constraint v3_supplier_offers_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade,
  add constraint v3_supplier_offers_supplier_id_fkey foreign key (supplier_id)
    references public.v3_suppliers(id) on delete cascade,
  add constraint v3_supplier_offers_product_id_fkey foreign key (product_id)
    references public.v3_products(id) on delete cascade,
  add constraint v3_supplier_offers_unit_id_fkey foreign key (unit_id)
    references public.v3_units_of_measure(id) on delete set null;
alter table public.v3_supplier_offers enable row level security;

drop table if exists public.v3_supplier_incidents cascade;
create table public.v3_supplier_incidents (like public.supplier_incidents including all);
-- severity tiene default 'warning'::incident_severity → hay que dropear/reconfigurar tras ALTER TYPE
alter table public.v3_supplier_incidents alter column severity drop default;
alter table public.v3_supplier_incidents
  alter column incident_type type public.v3_incident_type using incident_type::text::public.v3_incident_type,
  alter column severity type public.v3_incident_severity using severity::text::public.v3_incident_severity;
alter table public.v3_supplier_incidents
  alter column severity set default 'warning'::public.v3_incident_severity;
alter table public.v3_supplier_incidents
  add constraint v3_supplier_incidents_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade,
  add constraint v3_supplier_incidents_supplier_id_fkey foreign key (supplier_id)
    references public.v3_suppliers(id) on delete cascade,
  add constraint v3_supplier_incidents_recorded_by_fkey foreign key (recorded_by)
    references auth.users(id) on delete set null;
-- FK OMITIDA: purchase_order_id → v3_purchase_orders (pendiente sprint-05).
alter table public.v3_supplier_incidents enable row level security;

drop table if exists public.v3_product_supplier_refs cascade;
create table public.v3_product_supplier_refs (like public.product_supplier_refs including all);
alter table public.v3_product_supplier_refs
  add constraint v3_product_supplier_refs_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade,
  add constraint v3_product_supplier_refs_supplier_id_fkey foreign key (supplier_id)
    references public.v3_suppliers(id) on delete cascade,
  add constraint v3_product_supplier_refs_product_id_fkey foreign key (product_id)
    references public.v3_products(id) on delete cascade,
  add constraint v3_product_supplier_refs_purchase_unit_id_fkey foreign key (purchase_unit_id)
    references public.v3_units_of_measure(id) on delete set null;
alter table public.v3_product_supplier_refs enable row level security;

drop table if exists public.v3_price_history cascade;
create table public.v3_price_history (like public.price_history including all);
alter table public.v3_price_history
  add constraint v3_price_history_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade,
  add constraint v3_price_history_supplier_id_fkey foreign key (supplier_id)
    references public.v3_suppliers(id) on delete cascade,
  add constraint v3_price_history_product_id_fkey foreign key (product_id)
    references public.v3_products(id) on delete cascade,
  add constraint v3_price_history_offer_id_fkey foreign key (offer_id)
    references public.v3_supplier_offers(id) on delete set null;
alter table public.v3_price_history enable row level security;

drop table if exists public.v3_recipe_ingredients cascade;
create table public.v3_recipe_ingredients (like public.recipe_ingredients including all);
alter table public.v3_recipe_ingredients
  add constraint v3_recipe_ingredients_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade,
  add constraint v3_recipe_ingredients_recipe_id_fkey foreign key (recipe_id)
    references public.v3_recipes(id) on delete cascade,
  add constraint v3_recipe_ingredients_product_id_fkey foreign key (product_id)
    references public.v3_products(id) on delete set null,
  add constraint v3_recipe_ingredients_unit_id_fkey foreign key (unit_id)
    references public.v3_units_of_measure(id) on delete set null;
alter table public.v3_recipe_ingredients enable row level security;

drop table if exists public.v3_recipe_steps cascade;
create table public.v3_recipe_steps (like public.recipe_steps including all);
alter table public.v3_recipe_steps
  add constraint v3_recipe_steps_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade,
  add constraint v3_recipe_steps_recipe_id_fkey foreign key (recipe_id)
    references public.v3_recipes(id) on delete cascade;
alter table public.v3_recipe_steps enable row level security;

drop table if exists public.v3_recipe_sub_recipes cascade;
create table public.v3_recipe_sub_recipes (like public.recipe_sub_recipes including all);
alter table public.v3_recipe_sub_recipes
  add constraint v3_recipe_sub_recipes_recipe_id_fkey foreign key (recipe_id)
    references public.v3_recipes(id) on delete cascade,
  add constraint v3_recipe_sub_recipes_sub_recipe_id_fkey foreign key (sub_recipe_id)
    references public.v3_recipes(id) on delete cascade,
  add constraint v3_recipe_sub_recipes_unit_id_fkey foreign key (unit_id)
    references public.v3_units_of_measure(id) on delete set null;
alter table public.v3_recipe_sub_recipes enable row level security;

drop table if exists public.v3_recipe_versions cascade;
create table public.v3_recipe_versions (like public.recipe_versions including all);
alter table public.v3_recipe_versions
  add constraint v3_recipe_versions_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade,
  add constraint v3_recipe_versions_recipe_id_fkey foreign key (recipe_id)
    references public.v3_recipes(id) on delete cascade;
alter table public.v3_recipe_versions enable row level security;

drop table if exists public.v3_menu_sections cascade;
create table public.v3_menu_sections (like public.menu_sections including all);
alter table public.v3_menu_sections
  add constraint v3_menu_sections_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade,
  add constraint v3_menu_sections_menu_id_fkey foreign key (menu_id)
    references public.v3_menus(id) on delete cascade;
alter table public.v3_menu_sections enable row level security;

drop table if exists public.v3_menu_section_recipes cascade;
create table public.v3_menu_section_recipes (like public.menu_section_recipes including all);
alter table public.v3_menu_section_recipes
  add constraint v3_menu_section_recipes_hotel_id_fkey foreign key (hotel_id)
    references public.v3_hotels(id) on delete cascade,
  add constraint v3_menu_section_recipes_section_id_fkey foreign key (section_id)
    references public.v3_menu_sections(id) on delete cascade,
  add constraint v3_menu_section_recipes_recipe_id_fkey foreign key (recipe_id)
    references public.v3_recipes(id) on delete cascade;
alter table public.v3_menu_section_recipes enable row level security;
