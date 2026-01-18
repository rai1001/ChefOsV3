# Matriz de funcionalidades (estado actual vs legado)

| Feature | Pantalla/Ruta | DB tablas | RPC/Edge Function | Rol | Estado |
| --- | --- | --- | --- | --- | --- |
| Autenticación email/password | /login | auth.users, org_members | n/a | todos | implementado (UI + Supabase) |
| Protección de rutas (middleware) | todas las protegidas | auth.sessions, org_members | n/a | todos | implementado (no documentado en refs) |
| Dashboard base (org + hoteles) | /dashboard | orgs, hotels | n/a | admin/planner | implementado (mínimo) |
| Dashboard KPIs + timeline | /dashboard | events, event_services, purchase_orders | dashboard_rolling_grid, dashboard_event_highlights | admin/planner | documentado (sin código) |
| Listado de eventos | /events | events, hotels, spaces | n/a | planner | documentado (placeholder UI) |
| Wizard creación de evento | /events/new | events, space_bookings, event_services | desconocido | planner | documentado (sin ruta) |
| Gestión de pedidos | /orders | purchase_orders, event_purchase_orders | receive_purchase_order | purchasing | documentado (placeholder UI) |
| Inventario y caducidades | /inventory | products (u otras tablas de inventario), hoteles | desconocido | chef/kitchen | documentado (placeholder UI) |
| Staff scheduling semanal | /staff | desconocido | desconocido | planner/staff | documentado (placeholder UI) |
| Ajustes maestros | /settings | orgs, org_members (suppliers, menús) | desconocido | admin | documentado (placeholder UI) |
| Importación/OCR | ImporterPage (no creada) | import_jobs, import_rows | import_commit | purchasing | documentado (sin código) |
| Planificación de producción | detalle evento/servicio | production_plans, production_tasks | desconocido | chef/kitchen | documentado (sin código) |
| Adjuntos/Storage por org | /events (sección adjuntos) | event_attachments | bucket `attachments` | admin/planner | implementado (UI mínima + RLS) |
| Seed org + hotel base | seed.sql | orgs, hotels | n/a | admin | implementado (script) |
| Bootstrap usuario admin | scripts/bootstrap-admin.ts | auth.users, org_members | Admin API (Supabase) | admin | falta (pendiente) |

## Missing from docs (existe en código)
- Protección de rutas via `middleware.ts` (redirección a `/login` si no hay sesión).
- AppShell y navegación principal (`src/modules/shared/ui/app-shell.tsx`).
- Seed SQL para org/hotel base (`supabase/seed.sql`) y RLS inicial en migración `20260118160000_init.sql`.

## Planned only (documentado pero no implementado)
- Dashboard con KPIs/timeline y RPCs `dashboard_rolling_grid` y `dashboard_event_highlights`.
- Wizard `/events/new` con servicios, espacios y resumen.
- Gestión completa de pedidos (`purchase_orders`, `event_purchase_orders`) con flujo de estados.
- Inventario FEFO, alertas de caducidad y reservas.
- Staff scheduling semanal con calendarios y permisos/vacaciones.
- Importación OCR (ImporterPage) con `import_jobs/import_rows` y RPC `import_commit`.
- Planes de producción y tareas ligadas a `event_services`.
- Bootstrap de usuario admin vía Admin API (solo documentado en SPRINT/objetivo).

## Orden sugerido de implementación (impacto)
1) A0: completar bootstrap auth real (script admin), seed idempotente org/hotel, guardias y conexión Supabase estable.
2) P1: dashboard KPIs + RPCs; listado de eventos y creación básica con RLS; pedidos mínimos con estados.
3) P1.5: inventario (datos base + alertas) y staff scheduling semanal.
4) P2: importación OCR + commit; planes de producción y tareas; mejoras de settings (proveedores/menús).

## Checklist para cerrar gaps
- [ ] Implementar script `scripts/bootstrap-admin.ts` idempotente (usa Admin API y SEED_*).
- [ ] Añadir migraciones para eventos/espacios/event_services con RLS + pgTAP.
- [ ] Exponer RPCs dashboard_* y tests pgTAP asociados.
- [ ] Crear ruta `/events/new` con wizard y validaciones.
- [ ] Completar `/orders` con mutations RLS y estados.
- [ ] Montar inventario básico (tablas/seed) y UI de alertas.
- [ ] Añadir flujo de staff scheduling y modelo correspondiente.
- [ ] Implementar ImporterPage + RPC `import_commit`.
- [ ] Añadir planes/tareas de producción y UI de seguimiento.
