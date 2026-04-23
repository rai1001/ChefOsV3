# ChefOS v3 Sprint 12 - Integrations

## Objetivo del sprint

Construir la base funcional inicial del módulo `integrations` dentro de la arquitectura oficial de ChefOS v3, con alcance cerrado y orientado a estabilizar el contrato base del dominio de integraciones del sistema.

Este sprint no existe para resolver toda la conectividad externa del producto.

Existe para definir y estabilizar la primera base operativa del módulo `integrations`.

---

## Estado del sprint

- Módulo principal: `integrations`
- Tipo de sprint: funcional
- Alcance: pequeño y cerrado
- Dependencias directas:
  - `sprint-00-foundation`
  - `sprint-01-identity`
- Multi-tenant, permisos y límites de módulo: obligatorios

---

## Propósito del módulo `integrations`

El módulo `integrations` es responsable del dominio de integraciones dentro del sistema.

Debe actuar como owner de los contratos relacionados con:

- integración base con sistema externo
- adapter mínimo
- contrato mínimo de entrada y salida
- estado base de integración
- validaciones mínimas del dominio
- mapeos mínimos entre modelo interno y externo
- contratos públicos que otros módulos puedan consumir sin invadir internals

No debe convertirse en owner de lógica fuente de negocio, automatización, notificaciones o reporting.

---

## Objetivo funcional exacto del sprint

Dejar definido e implementable el contrato base de `integrations` para que el sistema pueda manejar, de forma explícita y controlada:

- la integración base del dominio
- su adapter mínimo
- su contrato mínimo de entrada y salida
- su estado funcional inicial
- el acceso controlado a esa información desde otros módulos
- la frontera pública del módulo sin acceso caótico desde UI o páginas

---

## Resultado esperado

Al cerrar este sprint, el proyecto debe tener una primera base clara para `integrations` que permita:

- encapsular la lógica mínima del dominio de integraciones
- exponer contratos públicos base del módulo
- evitar acceso caótico a integraciones desde páginas o componentes
- preparar el terreno para procesos posteriores que dependan de integraciones
- permitir que futuros módulos consuman `integrations` mediante contrato público claro

---

## Alcance del sprint

### Incluye

- definición del ownership del módulo `integrations`
- definición de frontera pública del módulo
- definición de contratos base del dominio de integraciones
- definición de inputs y outputs mínimos del módulo
- diseño cerrado de la integración base y su estado inicial
- validación de restricciones base de acceso cuando aplique
- tests necesarios para el contrato base del módulo

### No incluye

- estrategia completa de conectividad externa del producto
- automatizaciones de sincronización
- notificaciones derivadas de integraciones
- reporting transversal de integraciones
- soporte completo para múltiples proveedores
- orquestación compleja multi-sistema
- migración masiva de legacy de integrations
- cambios funcionales en módulos no relacionados

---

## Módulo afectado

- `integrations`

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
- notifications
- hr
- agents

### Dependencia permitida

- `identity`, solo para contexto de usuario, tenant y permisos base si aplica

---

## Problemas que este sprint sí debe resolver

1. Definir qué pertenece realmente a `integrations`.
2. Evitar acceso improvisado a integraciones desde cualquier parte del sistema.
3. Fijar el contrato base que otros módulos podrán consumir.
4. Obligar a que datos, permisos y tenant del dominio de integraciones se traten de forma explícita.
5. Sentar una base revisable y testeable para crecimiento posterior.

---

## Problemas que este sprint no debe intentar resolver

1. Toda la estrategia de integraciones del sistema.
2. Toda la relación entre integrations y automation.
3. Toda la relación entre integrations y notifications.
4. Toda la analítica asociada a conectividad o sincronización.
5. Toda la gestión avanzada multi-proveedor.
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

Los entregables esperados de Sprint 12 son los mínimos necesarios para dejar una base estable del módulo `integrations`.

### 1. Definición operativa del módulo

Debe quedar claro:

- propósito
- frontera funcional
- ownership
- fuera de alcance
- dependencias autorizadas

### 2. Contratos públicos base del módulo

Debe quedar claro cómo exponer, como mínimo:

- integración base
- adapter mínimo
- contrato mínimo de entrada
- contrato mínimo de salida
- estado base de integración
- consulta de integración por contrato público
- mutación base cuando aplique
- restricciones mínimas de acceso asociadas

### 3. Estructura inicial del módulo

El módulo debe encajar en:

```txt
src/features/integrations/
```

Con estructura proporcional a su necesidad real y alineada con module-template.md.

### 4. Base de validación

Deben quedar definidos y/o implementados los tests necesarios para proteger:

- contrato del módulo
- adapter y mapeos mínimos
- restricciones base de acceso
- escenarios permitidos y denegados cuando apliquen

---

## Criterios de cierre del sprint

Sprint 12 solo se considera cerrado cuando:

- `integrations` tiene responsabilidad funcional clara.
- Existe frontera pública clara del módulo.
- La integración base no depende de acceso caótico desde UI o páginas.
- El contrato base del módulo está definido con claridad.
- Permisos y tenancy fueron tratados explícitamente.
- El sprint no mezcló trabajo de otros módulos.
- Hay validación suficiente según riesgo.
- El resultado deja base real para procesos posteriores que dependan de integraciones.

---

## Tareas del sprint

### Tarea 12.01 - Definir responsabilidad exacta del módulo integrations

**Objetivo:**

- fijar qué pertenece al módulo
- fijar qué queda fuera
- fijar ownership funcional

**Salida esperada:**

- definición cerrada del alcance del módulo

### Tarea 12.02 - Definir contrato público base de integrations

**Objetivo:**

- establecer qué debe exponer públicamente el módulo
- evitar acceso informal a internals
- preparar consumo controlado desde otros módulos

**Salida esperada:**

- contrato público base documentado o implementado

### Tarea 12.03 - Definir integración base y estado inicial

**Objetivo:**

- fijar la pieza mínima del dominio de integraciones sobre la que crecerá el módulo
- dejar claros su adapter mínimo, su contrato base y su estado funcional inicial

**Salida esperada:**

- modelo base del dominio de integraciones definido por contrato

### Tarea 12.04 - Validar restricciones base de acceso y tenancy

**Objetivo:**

- asegurar que el contrato inicial no ignora aislamiento multi-tenant
- proteger escenarios permitidos y denegados del dominio de integraciones

**Salida esperada:**

- reglas base de acceso asociadas al módulo

### Tarea 12.05 - Definir tests del contrato base del módulo

**Objetivo:**

- asegurar cobertura mínima sobre comportamiento, permisos y límites del módulo

**Salida esperada:**

- cobertura mínima de validación para contrato, tenancy y acceso

### Tarea 12.06 - Revisar el módulo contra arquitectura y definition of done

**Objetivo:**

- asegurar que `integrations` queda bien ubicado
- asegurar que no invade otros módulos
- asegurar que el sprint cierra de forma verificable

**Salida esperada:**

- validación estructurada del sprint

---

## Riesgos del sprint

### Riesgo 1. Intentar resolver toda la complejidad del dominio de integraciones

- **Mitigación:** limitar el sprint al contrato base y a la integración mínima del módulo

### Riesgo 2. Mezclar integrations con automation, notifications, reporting o lógica fuente de otros módulos

- **Mitigación:** mantener ownership estricto y no introducir lógica de otros dominios dentro del módulo

### Riesgo 3. Acabar con un módulo ambiguo o demasiado abstracto

- **Mitigación:** exigir contratos concretos, entradas claras y salidas claras

### Riesgo 4. Ignorar multi-tenant al definir integraciones

- **Mitigación:** tratar tenant y permisos como parte obligatoria del contrato base

### Riesgo 5. Poner lógica de integraciones en páginas, layouts o componentes

- **Mitigación:** concentrar la lógica del módulo en `src/features/integrations/` y exponer frontera pública

---

## Validación del sprint

Antes de cerrar Sprint 12, debe poder responderse:

- ¿está claro qué pertenece a `integrations`?
- ¿el resto del sistema puede consumir `integrations` sin invadir internals?
- ¿la integración base y su estado inicial tienen contrato claro?
- ¿permisos y tenancy fueron considerados explícitamente?
- ¿el sprint evitó mezclar tareas de otros módulos?
- ¿hay tests proporcionales al riesgo?
- ¿la base creada permite avanzar al siguiente sprint sin caos?

Si alguna respuesta crítica es no, Sprint 12 no está cerrado.

---

## Definition of Done del sprint

Sprint 12 está done solo cuando:

- el módulo `integrations` tiene frontera clara
- el contrato base del módulo existe y es comprensible
- la integración base está tratada como concern oficial del módulo
- permisos y multi-tenant fueron contemplados cuando aplicaban
- el trabajo respeta arquitectura, workflow y standards
- no se mezcló rediseño global ni trabajo lateral
- el sprint deja una salida concreta, verificable y reutilizable

---

## Preparación para sprints posteriores

Una vez cerrado Sprint 12, el proyecto debería quedar listo para que módulos posteriores puedan consumir `integrations` con un contrato estable, en lugar de resolver conectividad externa de forma dispersa.

Los siguientes sprints deberán construirse sobre esta base, no rodearla.

---

## Estado de este documento

Este archivo define el Sprint 12 oficial del módulo `integrations` en ChefOS v3.

Su función es continuar la fase funcional del proyecto con un alcance pequeño, controlado y compatible con la arquitectura oficial.

---

## Detalle específico del dominio (heredado de v2)

Absorbe el estado de integraciones PMS/POS de v2. Migración `00025_m12_integrations` + security hardening `00028_security_hardening` + `00029_sync_type_and_config_validation` + fix `00032_fix_m12_sync_logs`.

### Funcionalidades principales

Integración con sistemas externos del hotel (PMS, POS) para **sincronización de datos operativos**, no escritura bidireccional salvo en casos específicos.

**PMS (Property Management System)**

- Proveedores soportados: Mews, OPERA, [extensible].
- Sync operations: `test_connection`, `sync_occupancy`, `sync_reservations`.
- Datos absorbidos: ocupación futura (para previsión), reservations (para cross-reference con eventos).

**POS (Point of Sale)**

- Proveedores soportados: Lightspeed, Simphony, [extensible].
- Sync operations: `test_connection`, `sync_sales`, `push_kitchen_orders` (escritura externa — solo superadmin+direction).
- Datos absorbidos: ventas reales (para cost variance real).

**Credentials isolation** (crítico, ver `specs/database-security.md`):

- Credentials nunca accesibles vía PostgREST directo.
- Solo vía `get_pms_integrations` / `get_pos_integrations` (RPC SECURITY DEFINER) que proyecta metadata sin credentials.
- Leer credentials raw requiere admin+ (00028).

### Modelo de datos

- `PMSIntegration` — hotel_id, pms_type (mews|opera|...), name, credentials (jsonb encriptado), config (jsonb), status (active|disabled|error), last_sync_at.
- `POSIntegration` — hotel_id, pos_type (lightspeed|simphony|...), name, credentials, config, status, last_sync_at.
- `IntegrationSyncLog` — integration_id, integration_type (pms|pos), sync_type, started_at, completed_at, status (running|completed|failed), response_payload (jsonb, solo admin+), error_message (solo admin+).

### Contratos públicos (`src/features/integrations/index.ts`)

Types: `PMSIntegration`, `POSIntegration`, `IntegrationSyncLog`, `PMSType`, `POSType`, `IntegrationStatus`, `SyncType`, `SyncLogStatus`, `INTEGRATION_STATUS_VARIANT`, `SYNC_VARIANT`.

Hooks:

- `usePMSIntegrations()`, `usePOSIntegrations()` — metadata (sin credentials)
- `useCreatePMSIntegration()`, `useUpdatePMSIntegration()`, `useDisablePMSIntegration()` (admin+ only)
- `useTriggerPMSSync(integrationId, syncType)`, `useTriggerPOSSync(integrationId, syncType)`
- `useIntegrationSyncLogs(integrationId)` (admin+ only para ver payloads/errors)
- `useMarkSyncComplete()` — llamado internamente por worker

### Casos de uso (`application/`)

- `use-integrations.ts`, `use-pms-integrations.ts`, `use-pos-integrations.ts`
- `use-create-integration.ts`, `use-update-integration.ts`, `use-disable-integration.ts`
- `use-trigger-sync.ts`
- `use-sync-logs.ts`

### RPCs consumidas

Metadata (todos los miembros):

- `get_pms_integrations(p_hotel_id)` — lista sin credentials
- `get_pos_integrations(p_hotel_id)` — lista sin credentials

Admin+ (ver `permissions-matrix.md`):

- `create_pms_integration`, `update_pms_integration`, `disable_pms_integration`
- `create_pos_integration`, `update_pos_integration`, `disable_pos_integration`
- `trigger_pms_sync(p_integration_id, p_sync_type)` — whitelist sync_type (00029), validación config activa
- `trigger_pos_sync(...)` — `push_kitchen_orders` requiere direction+ (00028)
- `get_integration_sync_logs(p_integration_id)` — admin+ (payloads sensibles)

Service-only (llamado por worker, REVOKE authenticated):

- `mark_sync_complete(p_log_id, p_status, p_response, p_error)`

### Edge Functions

Jobs consumidos desde `automation-worker`:

- `sync_pms` → invoca API externa del PMS, guarda `response_payload`, llama `mark_sync_complete`.
- `sync_pos` → análogo para POS.

Ambos validan `Authorization` + usan credentials desde DB (solo aquí se leen).

### Eventos de dominio

Emite: `integration.sync_started`, `integration.sync_completed`, `integration.sync_failed`.

Consume: `automation.job_started|completed|failed` (estado del job asociado).

### Tests mínimos

Unit: validación whitelist de sync*type, rol admin+ requerido para trigger*\*\_sync.

Integration: credentials NO leídos con rol operativo (denegado); sync_log payload no leído con rol operativo.

E2E (gated): setup mock PMS → trigger sync_occupancy → log completado → ocupación reflejada en reporting.

### Criterio de done específico

- [ ] Credentials nunca visibles en frontend.
- [ ] Whitelist sync_type rechaza valores fuera de lista.
- [ ] `config.<sync_type>` debe ser true para poder encolar (defense in depth).
- [ ] push_kitchen_orders restringido a direction+.
- [ ] Rotación de credentials manual post-incidente documentada.
- [ ] Tests cross-tenant: admin hotelA no ve integraciones hotelB.

### Referencias cruzadas

- `specs/database-security.md` (credentials isolation, patrón RLS para payloads)
- `specs/permissions-matrix.md` (matriz integraciones)
- `sprints/sprint-10-automation.md` (jobs sync_pms/sync_pos)
- `sprints/sprint-08-reporting.md` (sync_sales alimenta cost variance real)
- `skills/integrations/`
