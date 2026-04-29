# Sprint-12 — Notificaciones in-app

## Objetivo

Sistema de notificaciones in-app per-user-per-hotel: cuando un evento operativo se persiste en `v3_domain_events`, un trigger fan-out síncrono crea una notificación por cada miembro activo del hotel cuyo rol esté en la whitelist mapeada al `event_type`. UI con badge en sidebar, dropdown con últimas 20, página `/notifications` para historial completo y `/settings/notifications` para preferencias por categoría.

## Scope cerrado

- Migración `00088_v3_notifications.sql`.
- Tablas:
  - `v3_notifications` (per-user-per-hotel, RLS RPC-only insert, idempotencia `(event_id, user_id)`).
  - `v3_notification_preferences` (PK `(hotel_id, user_id, category)`, default-on).
- Enum `v3_notification_severity` (info/success/warning/critical).
- Mapping helper `v3_event_to_notification(event_type, payload)` cubriendo 5 event types prioritarios.
- Fan-out interno `v3__notifications_create_from_event(event_id)` con join a memberships filtrando por target_roles + preferences.
- Trigger `v3_domain_events_notify_after_insert` after insert on `v3_domain_events`.
- 6 RPCs user-facing:
  - `v3_get_notifications`
  - `v3_get_unread_notifications_count`
  - `v3_mark_notification_read`
  - `v3_mark_all_notifications_read`
  - `v3_get_notification_preferences`
  - `v3_upsert_notification_preference`
- TS layer: domain (types/schemas/errors), infrastructure (queries+rpcs), application (6 hooks + 3 server helpers).
- UI:
  - `<NotificationBell />` en header dashboard con badge unread + dropdown 20 más recientes.
  - `/notifications` historial con filtro `?unread=true` y mark-all-read.
  - `/settings/notifications` toggles por las 5 categorías.
- Polling 60s (no-bg) en unread count.

## Event types cubiertos v0

| Event type | Categoría | Severity | Target roles |
|---|---|---|---|
| `temperature.out_of_range` | compliance | critical | superadmin, direction, admin, head_chef, sous_chef, warehouse |
| `compliance.quality_checked` (solo si `all_ok=false`) | compliance | warning | superadmin, direction, admin, head_chef, procurement |
| `compliance.cleaning_overdue` | compliance | warning | superadmin, direction, admin, head_chef, sous_chef |
| `production.completed` | production | success | superadmin, direction, admin, head_chef, sous_chef, cook |
| `lot.expiring_soon` | inventory | warning | superadmin, direction, admin, head_chef, warehouse |

Mapping en `v3_event_to_notification` devuelve `{category, severity, target_roles[], title, body, link}` o `null` para ignorar.

## Decisiones

- **Fan-out síncrono via trigger** (ADR-0024): aceptable para hoteles con <50 miembros, sprint-13+ puede mover a queue async si crece.
- **Sin tabla `notification_subscriptions`**: las preferencias se aplican vía `v3_notification_preferences` con default-on por categoría, no por event_type.
- **Idempotencia**: unique `(event_id, user_id)` parcial donde `event_id is not null`.
- **RLS**: cada usuario solo ve sus propias notificaciones (`user_id = auth.uid()`). Insert RPC-only (`with check (false)` + helpers SECURITY DEFINER).
- **Polling 60s** para unread count (sprint-13+ migrar a Realtime channels).
- **Retention**: índice por `created_at desc`, sin job de archivado v0.

## Permisos

Cada usuario activo del hotel:
- Lee SUS notificaciones (RLS self).
- Marca SUS notificaciones leídas.
- Configura SUS preferencias por categoría.

Helpers internos (`v3_event_to_notification`, `v3__notifications_create_from_event`, `v3_tg_notify_from_event`) sin grant a authenticated. RPCs user-facing con `revoke from public, anon, authenticated` + `grant execute to authenticated`.

## Fuera de alcance (sprint-13+)

- Push notifications (web push, FCM).
- Email digest.
- SMS.
- Slack/Teams integrations.
- Realtime via Supabase channels (v0 polling es suficiente).
- Dedup window por equipo (cuando Eurostars lo pida).
- Notification preferences finas por event_type (v0: solo por category).

## Riesgos

1. **Fan-out síncrono lento**: si event genera notification para 50+ miembros, ralentiza la transacción que crea el event. Mitigación v0: aceptable. Sprint-13 puede mover a queue.
2. **Spam de `temperature.out_of_range`**: equipo mal calibrado puede disparar cada 5 min. Mitigación pendiente: dedup window 1h por `(user_id, event_type, payload->>'equipment_id')` (sprint-12b si Eurostars lo pide).
3. **Cross-tenant leak**: cubierto por RLS `user_id = auth.uid()`. Test obligatorio.
4. **Mapping events nuevos**: extender `v3_event_to_notification` cuando sprints futuros añadan event_types nuevos.
5. **Performance del badge poll**: 60s × 100 usuarios = 100 reqs/min. Migrar a Realtime cuando crezca.

## Validación

- Smoke DB ejecutado en hotel Eurostars Demo (3 miembros: admin/commercial/head_chef):
  - `temperature.out_of_range` → 2 notificaciones (admin + head_chef), commercial excluido.
  - Idempotencia: re-ejecutar fan-out con mismo `event_id` no duplica.
  - Preference disable head_chef compliance → 2º evento solo notifica admin (1 notif).
  - `compliance.quality_checked` con `all_ok=true` ignorado.
  - Event type unknown ignorado.
- Vitest:
  - `domain/schemas.test.ts`: 8 tests.
  - `infrastructure/notification-rpcs.test.ts`: 5 tests.
  - `components/notification-bell.test.tsx`: 3 tests.
  - `components/notification-preferences-form.test.tsx`: 3 tests.
- Advisors: 9 funciones nuevas con `search_path=public`, helpers internos sin grants, RPCs user-facing solo authenticated.
