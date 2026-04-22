# ChefOS v3 Sprint 11 - Notifications

## Objetivo del sprint

Construir la base funcional inicial del módulo `notifications` dentro de la arquitectura oficial de ChefOS v3, con alcance cerrado y orientado a estabilizar el contrato base del dominio de notificaciones del sistema.

Este sprint no existe para resolver todo el sistema de comunicaciones del producto.

Existe para definir y estabilizar la primera base operativa del módulo `notifications`.

---

## Estado del sprint

- Módulo principal: `notifications`
- Tipo de sprint: funcional
- Alcance: pequeño y cerrado
- Dependencias directas:
  - `sprint-00-foundation`
  - `sprint-01-identity`
- Multi-tenant, permisos y límites de módulo: obligatorios

---

## Propósito del módulo `notifications`

El módulo `notifications` es responsable del dominio de notificaciones dentro del sistema.

Debe actuar como owner de los contratos relacionados con:

- notificación base del sistema
- plantilla o estructura mínima de mensaje
- canal mínimo de entrega cuando aplique al contrato base
- estado base de notificación
- reglas mínimas de validación del dominio
- contratos públicos que otros módulos puedan consumir sin invadir internals

No debe convertirse en owner de lógica fuente de negocio, automatización, integraciones o reporting.

---

## Objetivo funcional exacto del sprint

Dejar definido e implementable el contrato base de `notifications` para que el sistema pueda manejar, de forma explícita y controlada:

- la notificación base del dominio
- su estructura mínima de mensaje
- su canal mínimo de salida
- su estado funcional inicial
- el acceso controlado a esa información desde otros módulos
- la frontera pública del módulo sin acceso caótico desde UI o páginas

---

## Resultado esperado

Al cerrar este sprint, el proyecto debe tener una primera base clara para `notifications` que permita:

- encapsular la lógica mínima del dominio de notificaciones
- exponer contratos públicos base del módulo
- evitar acceso caótico a notificaciones desde páginas o componentes
- preparar el terreno para procesos posteriores que dependan de notificaciones
- permitir que futuros módulos consuman `notifications` mediante contrato público claro

---

## Alcance del sprint

### Incluye

- definición del ownership del módulo `notifications`
- definición de frontera pública del módulo
- definición de contratos base del dominio de notificaciones
- definición de inputs y outputs mínimos del módulo
- diseño cerrado de la notificación base y su estado inicial
- validación de restricciones base de acceso cuando aplique
- tests necesarios para el contrato base del módulo

### No incluye

- sistema completo de eventos del producto
- automatizaciones de notificación
- integraciones externas de mensajería
- reporting transversal de entregas
- preferencia avanzada por usuario o canal
- orquestación compleja multi-step
- migración masiva de legacy de notifications
- cambios funcionales en módulos no relacionados

---

## Módulo afectado

- `notifications`

### Módulos no objetivo en este sprint

No deben tocarse funcionalmente salvo dependencia mínima y explícita:

- commercial
- recipes
- catalog
- procurement
- inventory
- production
- reporting
- compliance
- automation
- integrations
- hr
- agents

### Dependencia permitida

- `identity`, solo para contexto de usuario, tenant y permisos base si aplica

---

## Problemas que este sprint sí debe resolver

1. Definir qué pertenece realmente a `notifications`.
2. Evitar acceso improvisado a notificaciones desde cualquier parte del sistema.
3. Fijar el contrato base que otros módulos podrán consumir.
4. Obligar a que datos, permisos y tenant del dominio de notificaciones se traten de forma explícita.
5. Sentar una base revisable y testeable para crecimiento posterior.

---

## Problemas que este sprint no debe intentar resolver

1. Toda la estrategia de comunicación del sistema.
2. Toda la relación entre notifications y automation.
3. Toda la relación entre notifications e integrations.
4. Toda la analítica asociada a entregas o aperturas.
5. Toda la gestión avanzada de canales y preferencias.
6. Reestructuración global de módulos fuente o consumidores.

---

## Dependencias del sprint

Este sprint depende de que los sprints anteriores ya hayan dejado cerrados:

- workflow oficial
- arquitectura oficial
- standards de código
- standards de testing
- política de migración
- definition of done
- plantilla oficial de módulos
- contrato base de `identity` para contexto de acceso y tenant

---

## Entregables del sprint

Los entregables esperados de Sprint 11 son los mínimos necesarios para dejar una base estable del módulo `notifications`.

### 1. Definición operativa del módulo

Debe quedar claro:

- propósito
- frontera funcional
- ownership
- fuera de alcance
- dependencias autorizadas

### 2. Contratos públicos base del módulo

Debe quedar claro cómo exponer, como mínimo:

- notificación base
- estructura mínima de mensaje
- canal mínimo de entrega
- estado base de notificación
- consulta de notificación por contrato público
- mutación base cuando aplique
- restricciones mínimas de acceso asociadas

### 3. Estructura inicial del módulo

El módulo debe encajar en:

```txt
src/features/notifications/
```

Con estructura proporcional a su necesidad real y alineada con module-template.md.

### 4. Base de validación

Deben quedar definidos y/o implementados los tests necesarios para proteger:

- contrato del módulo
- estructura mínima de mensaje y canal
- restricciones base de acceso
- escenarios permitidos y denegados cuando apliquen

---

## Criterios de cierre del sprint

Sprint 11 solo se considera cerrado cuando:

- `notifications` tiene responsabilidad funcional clara.
- Existe frontera pública clara del módulo.
- La notificación base no depende de acceso caótico desde UI o páginas.
- El contrato base del módulo está definido con claridad.
- Permisos y tenancy fueron tratados explícitamente.
- El sprint no mezcló trabajo de otros módulos.
- Hay validación suficiente según riesgo.
- El resultado deja base real para procesos posteriores que dependan de notificaciones.

---

## Tareas del sprint

### Tarea 11.01 - Definir responsabilidad exacta del módulo notifications

**Objetivo:**

- fijar qué pertenece al módulo
- fijar qué queda fuera
- fijar ownership funcional

**Salida esperada:**

- definición cerrada del alcance del módulo

### Tarea 11.02 - Definir contrato público base de notifications

**Objetivo:**

- establecer qué debe exponer públicamente el módulo
- evitar acceso informal a internals
- preparar consumo controlado desde otros módulos

**Salida esperada:**

- contrato público base documentado o implementado

### Tarea 11.03 - Definir notificación base y estado inicial

**Objetivo:**

- fijar la pieza mínima del dominio de notificaciones sobre la que crecerá el módulo
- dejar claros su mensaje mínimo, su canal base y su estado funcional inicial

**Salida esperada:**

- modelo base del dominio de notificaciones definido por contrato

### Tarea 11.04 - Validar restricciones base de acceso y tenancy

**Objetivo:**

- asegurar que el contrato inicial no ignora aislamiento multi-tenant
- proteger escenarios permitidos y denegados del dominio de notificaciones

**Salida esperada:**

- reglas base de acceso asociadas al módulo

### Tarea 11.05 - Definir tests del contrato base del módulo

**Objetivo:**

- asegurar cobertura mínima sobre comportamiento, permisos y límites del módulo

**Salida esperada:**

- cobertura mínima de validación para contrato, tenancy y acceso

### Tarea 11.06 - Revisar el módulo contra arquitectura y definition of done

**Objetivo:**

- asegurar que `notifications` queda bien ubicado
- asegurar que no invade otros módulos
- asegurar que el sprint cierra de forma verificable

**Salida esperada:**

- validación estructurada del sprint

---

## Riesgos del sprint

### Riesgo 1. Intentar resolver toda la complejidad del dominio de notificaciones

- **Mitigación:** limitar el sprint al contrato base y a la notificación mínima del módulo

### Riesgo 2. Mezclar notifications con automation, integrations, reporting o lógica fuente de otros módulos

- **Mitigación:** mantener ownership estricto y no introducir lógica de otros dominios dentro del módulo

### Riesgo 3. Acabar con un módulo ambiguo o demasiado abstracto

- **Mitigación:** exigir contratos concretos, entradas claras y salidas claras

### Riesgo 4. Ignorar multi-tenant al definir notificaciones

- **Mitigación:** tratar tenant y permisos como parte obligatoria del contrato base

### Riesgo 5. Poner lógica de notificaciones en páginas, layouts o componentes

- **Mitigación:** concentrar la lógica del módulo en `src/features/notifications/` y exponer frontera pública

---

## Validación del sprint

Antes de cerrar Sprint 11, debe poder responderse:

- ¿está claro qué pertenece a `notifications`?
- ¿el resto del sistema puede consumir `notifications` sin invadir internals?
- ¿la notificación base y su estado inicial tienen contrato claro?
- ¿permisos y tenancy fueron considerados explícitamente?
- ¿el sprint evitó mezclar tareas de otros módulos?
- ¿hay tests proporcionales al riesgo?
- ¿la base creada permite avanzar al siguiente sprint sin caos?

Si alguna respuesta crítica es no, Sprint 11 no está cerrado.

---

## Definition of Done del sprint

Sprint 11 está done solo cuando:

- el módulo `notifications` tiene frontera clara
- el contrato base del módulo existe y es comprensible
- la notificación base está tratada como concern oficial del módulo
- permisos y multi-tenant fueron contemplados cuando aplicaban
- el trabajo respeta arquitectura, workflow y standards
- no se mezcló rediseño global ni trabajo lateral
- el sprint deja una salida concreta, verificable y reutilizable

---

## Preparación para sprints posteriores

Una vez cerrado Sprint 11, el proyecto debería quedar listo para que módulos posteriores puedan consumir `notifications` con un contrato estable, en lugar de resolver comunicaciones del sistema de forma dispersa.

Los siguientes sprints deberán construirse sobre esta base, no rodearla.

---

## Estado de este documento

Este archivo define el Sprint 11 oficial del módulo `notifications` en ChefOS v3.

Su función es continuar la fase funcional del proyecto con un alcance pequeño, controlado y compatible con la arquitectura oficial.

---

## Detalle específico del dominio (heredado de v2)

Absorbe `docs/MODULO_ALERTAS_NOTIFICACIONES.md` de v2. Migración `00022_m14_notifications` + security hardening `00033_fix_notifications_rls` (is_member_of en todas las policies).

### Funcionalidades principales

`notifications` es **transversal**: consume eventos de otros módulos y decide **cuándo, a quién y cómo** avisar, evitando ruido y duplicidades. No crea reglas de negocio.

- **In-app Realtime**: Supabase Realtime suscripción a `notifications` para badge live sin polling.
- **Email dispatcher**: Edge Function `notification-dispatcher` con Resend, trigger DB INSERT → email.
- **Preferencias por usuario**: opt-in/out por tipo de notificación + canal.
- **Severity**: urgent (CRÍTICO), warning (AVISO), info (INFO). Heredada del módulo origen.
- **Destinatarios por rol** (MVP): jefe de cocina, compras, admin. Personal operativo solo ve tareas asignadas.
- **Deduplicación**: no generar la misma notificación activa dos veces; al resolverse el origen → marcada resuelta.

### Modelo de datos

- `Notification` — hotel_id, recipient_user_id, type, severity, title, body, action_url, is_read, is_dismissed, source_module, source_id, created_at, read_at.
- `NotificationPreference` — user_id, hotel_id, notification_type, channel (in_app|email|push), enabled.

### Contratos públicos (`src/features/notifications/index.ts`)

Types: `Notification`, `NotificationPreference`, `NotificationSeverity`, `NotificationType`, `NotificationChannel`, `NOTIFICATION_TYPES`, `NOTIFICATION_SEVERITY_DOT`, `NOTIFICATION_SEVERITY_COLORS`, `SEVERITY_VARIANT`.

Hooks:
- `useNotifications(limit?)` — lista
- `useNotificationCount()` — badge count
- `useNotificationRealtime()` — suscripción Realtime (background)
- `useMarkRead()`, `useMarkAllRead()`
- `useNotificationPreferences()`, `useUpsertPreference()`

### Casos de uso (`application/`)

- `use-notifications.ts`, `use-notification-count.ts`
- `use-notification-realtime.ts` (subscribe + invalidate queries)
- `use-mark-read.ts`, `use-mark-all-read.ts`
- `use-preferences.ts`, `use-upsert-preference.ts`

### RPCs consumidas

- `create_notification(p_hotel_id, p_recipient_user_id, p_type, p_severity, p_title, p_body, p_action_url, p_source_module, p_source_id)` — SECURITY DEFINER
- `mark_read(p_notification_id)` — requiere ser recipient
- `mark_all_read(p_hotel_id)`
- `get_unread(p_limit)`, `get_count()`
- `get_preferences()`, `upsert_preference(p_type, p_channel, p_enabled)`

Trigger `trg_auto_notify`:
- Se dispara tras `create_notification` insert.
- Si canal email activo para ese user+type → encola job `send_notification_email`.

### Edge Function

`notification-dispatcher`:
- Valida `Authorization: Bearer <service_role>`.
- Lee notification desde DB por `id` (no confía en payload del webhook).
- Reconstruye email desde DB usando `APP_BASE_URL` como prefijo interno (safeUrl solo rutas internas — post-Codex audit 2026-04-15).
- Envía vía Resend API.

### Eventos de dominio

Emite: `notification.created`, `notification.read`, `notification.email_sent`.

Consume (dispara creación de notificaciones):
- `inventario.lote_expiring` → warning
- `inventario.lote_expired` → urgent
- `pedido.received_partial` (si impacta evento) → warning
- `proveedor.incidencia_created` → warning
- `tarea_produccion.updated` (blocked) → warning
- `temperature.out_of_range` → urgent
- `alert.raised` → con severity del alert

### Tests mínimos

Unit: deduplicación (misma notification 2× en ventana → dedup), preferencias respetadas (email opt-out → no dispatch).

Integration: Realtime subscription actualiza badge sin recarga, trigger trg_auto_notify encola job correctamente.

E2E: temperature out_of_range → notification creada → email enviado a destinatarios de rol admin+.

### Criterio de done específico

- [ ] Badge count refresca <1s tras nueva notification (Realtime).
- [ ] Email llega con enlace `APP_BASE_URL/...` correcto.
- [ ] Deduplicación evita spam (misma alerta activa no se re-envía).
- [ ] Preferencias respetadas por tipo+canal.
- [ ] Mark all read funciona con 100 notifications sin lag.
- [ ] RLS: user solo ve sus propias notifications (is_member_of + recipient check).

### Referencias cruzadas

- Consumidor de eventos de todos los módulos operativos
- `sprints/sprint-10-automation.md` — job `send_notification_email` ejecutado por worker
- `specs/database-security.md` (Edge Functions con service_role)
- `checklists/release-runbook.md` — database webhook config
- `skills/notifications/`
