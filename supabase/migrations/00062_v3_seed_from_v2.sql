-- 00062_v3_seed_from_v2.sql
-- ADR-0015 Fase 1 DB: INSERT SELECT v2 → v3 para el hotel Eurostars Demo
-- (22222222-2222-2222-2222-222222222222) y su tenant (10000000-2000-2000-2000-000000000001).
-- Orden FK-safe. Todas las INSERT son idempotentes (ON CONFLICT DO NOTHING).
-- Casts enum explícitos: col::text::public.v3_<enum>.
--
-- NO se sembra v3_product_categories (v2 no tiene esa tabla).
-- v3_supplier_incidents.purchase_order_id → NULL (v3_purchase_orders pendiente sprint-05).
-- import_runs v2 se dropeó en 00058, no hay rows que copiar.

-- ═══════════════════════════════════════════════════════════════════════════════
-- Identity
-- ═══════════════════════════════════════════════════════════════════════════════

insert into public.v3_tenants (id, name, created_at)
select id, name, created_at from public.tenants
where id = '10000000-2000-2000-2000-000000000001'
on conflict (id) do nothing;

insert into public.v3_hotels (id, tenant_id, name, slug, timezone, currency, is_active, created_at)
select id, tenant_id, name, slug, timezone, currency, is_active, created_at
from public.hotels where id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

insert into public.v3_memberships (id, user_id, hotel_id, tenant_id, role, is_active, is_default, created_at)
select id, user_id, hotel_id, tenant_id, role::text::public.v3_app_role, is_active, is_default, created_at
from public.memberships where hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

insert into public.v3_profiles (id, full_name, phone, avatar_url, updated_at)
select id, full_name, phone, avatar_url, updated_at from public.profiles
where id in (
  select user_id from public.memberships where hotel_id = '22222222-2222-2222-2222-222222222222'
)
on conflict (id) do nothing;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Catalog - orden: units (self-ref en 2 pasos) → products → aliases → suppliers
-- ═══════════════════════════════════════════════════════════════════════════════

-- units_of_measure: self-ref base_unit_id → copiar primero sin base_unit_id, luego con.
insert into public.v3_units_of_measure
select u.* from public.units_of_measure u
where u.hotel_id = '22222222-2222-2222-2222-222222222222' and u.base_unit_id is null
on conflict (id) do nothing;

insert into public.v3_units_of_measure
select u.* from public.units_of_measure u
where u.hotel_id = '22222222-2222-2222-2222-222222222222' and u.base_unit_id is not null
on conflict (id) do nothing;

-- products: category_id → NULL (v3_product_categories vacía; v2.categories no se migra)
insert into public.v3_products (
  id, hotel_id, name, description, default_unit_id,
  category_id, storage_type, is_active, created_at, updated_at,
  sku, barcode, allergens, dietary_tags, notes, image_url
)
select id, hotel_id, name, description, default_unit_id,
  null::uuid as category_id,
  storage_type::text::public.v3_storage_type,
  is_active, created_at, updated_at,
  sku, barcode, allergens, dietary_tags, notes, image_url
from public.products where hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

insert into public.v3_product_aliases (
  id, hotel_id, product_id, alias_name, source_type, confidence_score, created_at, created_by, notes
)
select id, hotel_id, product_id, alias_name,
  source_type::text::public.v3_alias_source,
  confidence_score, created_at, created_by, notes
from public.product_aliases where hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

insert into public.v3_suppliers select * from public.suppliers
where hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

insert into public.v3_supplier_configs select * from public.supplier_configs
where hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

insert into public.v3_supplier_offers select * from public.supplier_offers
where hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

-- supplier_incidents: purchase_order_id → NULL (v3_purchase_orders no existe aún)
insert into public.v3_supplier_incidents (
  id, hotel_id, supplier_id, purchase_order_id, incident_type, description,
  severity, occurred_at, recorded_by, created_at
)
select id, hotel_id, supplier_id, null::uuid as purchase_order_id,
  incident_type::text::public.v3_incident_type,
  description,
  severity::text::public.v3_incident_severity,
  occurred_at, recorded_by, created_at
from public.supplier_incidents where hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

insert into public.v3_product_supplier_refs select * from public.product_supplier_refs
where hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

insert into public.v3_price_history select * from public.price_history
where hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Recipes - orden: recipes → ingredients → steps → sub_recipes → versions
-- ═══════════════════════════════════════════════════════════════════════════════

insert into public.v3_recipes
select r.id, r.hotel_id, r.name, r.description,
  r.category::text::public.v3_recipe_category,
  r.subcategory, r.servings, r.yield_qty, r.yield_unit_id,
  r.prep_time_min, r.cook_time_min, r.rest_time_min,
  r.difficulty::text::public.v3_recipe_difficulty,
  r.status::text::public.v3_recipe_status,
  r.target_price, r.allergens, r.dietary_tags, r.notes, r.image_url,
  r.created_by, r.approved_by, r.created_at, r.updated_at, r.approved_at,
  r.total_cost, r.cost_per_serving, r.food_cost_pct, r.unit_cost, r.yield_pct
from public.recipes r where r.hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

insert into public.v3_recipe_ingredients select * from public.recipe_ingredients
where hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

insert into public.v3_recipe_steps select * from public.recipe_steps
where hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

insert into public.v3_recipe_sub_recipes select * from public.recipe_sub_recipes
where recipe_id in (
  select id from public.recipes where hotel_id = '22222222-2222-2222-2222-222222222222'
)
on conflict (id) do nothing;

insert into public.v3_recipe_versions select * from public.recipe_versions
where hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Menus
-- ═══════════════════════════════════════════════════════════════════════════════

insert into public.v3_menus
select id, hotel_id, name, description,
  menu_type::text::public.v3_menu_type,
  is_active, created_at, updated_at, created_by
from public.menus where hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

insert into public.v3_menu_sections select * from public.menu_sections
where hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

insert into public.v3_menu_section_recipes select * from public.menu_section_recipes
where hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Commercial - orden: clients → events → versions/spaces/menus/op_impact
-- ═══════════════════════════════════════════════════════════════════════════════

insert into public.v3_clients
select id, hotel_id, name, email, phone, company, tax_id, address, city, postal_code, country,
  vip_level::text::public.v3_vip_level,
  notes, is_active, created_at, updated_at
from public.clients where hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

insert into public.v3_events
select e.id, e.hotel_id, e.client_id, e.name,
  e.event_type::text::public.v3_event_type,
  e.service_type::text::public.v3_service_type,
  e.event_date, e.start_time, e.end_time, e.guest_count,
  e.venue, e.setup_time, e.teardown_time,
  e.status::text::public.v3_event_status,
  e.notes, e.beo_number, e.theoretical_cost, e.actual_cost,
  e.cancel_reason, e.created_by, e.created_at, e.updated_at
from public.events e where e.hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

insert into public.v3_event_spaces select * from public.event_spaces
where hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

insert into public.v3_event_menus select * from public.event_menus
where hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

insert into public.v3_event_operational_impact
select id, hotel_id, event_id, product_id, product_name, quantity_needed, unit,
  department::text::public.v3_department
from public.event_operational_impact where hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

insert into public.v3_event_versions select * from public.event_versions
where hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Audit / domain events - selectivo
-- ═══════════════════════════════════════════════════════════════════════════════

insert into public.v3_audit_logs select * from public.audit_logs
where hotel_id = '22222222-2222-2222-2222-222222222222'
on conflict (id) do nothing;

insert into public.v3_domain_events select * from public.domain_events
where hotel_id = '22222222-2222-2222-2222-222222222222'
  and created_at > now() - interval '30 days'
on conflict (id) do nothing;
