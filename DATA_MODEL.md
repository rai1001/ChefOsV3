# Modelo de datos (resumen)

## Regla #1
**No inventar campos.** Cuando haya duda, mirar:
1) `supabase/migrations/*`
2) `docs/reference/SPEC_SUPABASE_SCHEMA.sql`
3) `SPEC_API.md` / `SPEC_RLS.md`

## Multi-tenancy
- Todas las tablas de negocio llevan `org_id`.
- La pertenencia del usuario a una org se modela en `org_members` (a veces referido como *memberships*).

## Tablas base (baseline)
> Fuente: `docs/reference/SPEC_SUPABASE_SCHEMA.sql`

### orgs
- `id` (uuid, PK)
- `name` (text)
- `slug` (text, unique)

### org_members
- `org_id` (uuid, FK → orgs)
- `user_id` (uuid)
- `role` (text)
- `is_active` (bool)

### hotels
- `id` (uuid, PK)
- `org_id` (uuid, FK)
- `name` (text)

## Eventos
### events
- `id`, `org_id`, `hotel_id`
- `title`
- `starts_at`, `ends_at`
- `status` enum: `draft|confirmed|cancelled`

### spaces
- `id`, `org_id`, `hotel_id`, `name`

### space_bookings
- `id`, `org_id`, `event_id`, `space_id`
- `starts_at`, `ends_at`

### event_services
- `id`, `org_id`, `event_id`
- `service_type` enum: `coffee_break|dinner|production`
- `format` enum: `de_pie|sentado`

## Producción
### production_plans
- `id`, `org_id`, `hotel_id`, `event_service_id`
- `status` enum: `draft|in_progress|done`

### production_tasks
- `id`, `org_id`, `hotel_id`, `plan_id`
- `title`, `station`, `priority`

## Compras (baseline mínimo)
### products
- `id`, `org_id`, `name`, `unit`

### purchase_orders
- `id`, `org_id`, `hotel_id`, `supplier_id`
- `status` enum: `draft|approved|ordered|received`
- `total_estimated`

### event_purchase_orders
- `id`, `org_id`, `event_id`
- `status` enum: `draft|approved|ordered|received`

## Entidades mencionadas en specs (pueden existir en migraciones)
Estas entidades aparecen en documentación funcional, pero **no están en el baseline**. Verifica en `supabase/migrations` antes de usarlas:
- suppliers, supplier_items
- ingredients
- stock_batches/stock_levels/reservations
- import_jobs/import_rows
- ocr_jobs/event_attachments
- expiry_rules/expiry_alerts
