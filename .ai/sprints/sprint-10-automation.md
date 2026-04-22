# ChefOS v3 Sprint 10 - Automation

## Objetivo del sprint

Construir la base funcional inicial del módulo `automation` dentro de la arquitectura oficial de ChefOS v3, con alcance cerrado y orientado a estabilizar el contrato base del dominio de automatización del sistema.

Este sprint no existe para resolver toda la orquestación automática del producto.

Existe para definir y estabilizar la primera base operativa del módulo `automation`.

---

## Estado del sprint

- Módulo principal: `automation`
- Tipo de sprint: funcional
- Alcance: pequeño y cerrado
- Dependencias directas:
  - `sprint-00-foundation`
  - `sprint-01-identity`
- Multi-tenant, permisos y límites de módulo: obligatorios

---

## Propósito del módulo `automation`

El módulo `automation` es responsable del dominio de automatización dentro del sistema.

Debe actuar como owner de los contratos relacionados con:

- regla base de automatización
- trigger o disparador mínimo
- condición mínima de ejecución
- acción automática mínima
- estado base de automatización
- reglas mínimas de validación del dominio
- contratos públicos que otros módulos puedan consumir sin invadir internals

No debe convertirse en owner de lógica fuente de negocio, notificaciones, integraciones o reporting.

---

## Objetivo funcional exacto del sprint

Dejar definido e implementable el contrato base de `automation` para que el sistema pueda manejar, de forma explícita y controlada:

- la regla base de automatización del dominio
- su trigger mínimo
- su condición mínima
- su estado funcional inicial
- el acceso controlado a esa información desde otros módulos
- la frontera pública del módulo sin acceso caótico desde UI o páginas

---

## Resultado esperado

Al cerrar este sprint, el proyecto debe tener una primera base clara para `automation` que permita:

- encapsular la lógica mínima del dominio de automatización
- exponer contratos públicos base del módulo
- evitar acceso caótico a automatizaciones desde páginas o componentes
- preparar el terreno para procesos posteriores que dependan de automatización
- permitir que futuros módulos consuman `automation` mediante contrato público claro

---

## Alcance del sprint

### Incluye

- definición del ownership del módulo `automation`
- definición de frontera pública del módulo
- definición de contratos base del dominio de automatización
- definición de inputs y outputs mínimos del módulo
- diseño cerrado de la regla base de automatización y su estado inicial
- validación de restricciones base de acceso cuando aplique
- tests necesarios para el contrato base del módulo

### No incluye

- sistema completo de eventos del producto
- notificaciones como canal de salida
- integraciones externas de ejecución
- reporting transversal de automatizaciones
- automatizaciones avanzadas multi-módulo
- orquestación compleja de workflows largos
- migración masiva de legacy de automation
- cambios funcionales en módulos no relacionados

---

## Módulo afectado

- `automation`

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
- notifications
- integrations
- hr
- agents

### Dependencia permitida

- `identity`, solo para contexto de usuario, tenant y permisos base si aplica

---

## Problemas que este sprint sí debe resolver

1. Definir qué pertenece realmente a `automation`.
2. Evitar acceso improvisado a reglas automáticas desde cualquier parte del sistema.
3. Fijar el contrato base que otros módulos podrán consumir.
4. Obligar a que datos, permisos y tenant del dominio de automatización se traten de forma explícita.
5. Sentar una base revisable y testeable para crecimiento posterior.

---

## Problemas que este sprint no debe intentar resolver

1. Toda la estrategia de automatización del sistema.
2. Toda la relación entre automation y notifications.
3. Toda la relación entre automation e integrations.
4. Toda la analítica asociada a automatizaciones.
5. Toda la ejecución multi-step de workflows complejos.
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

Los entregables esperados de Sprint 10 son los mínimos necesarios para dejar una base estable del módulo `automation`.

### 1. Definición operativa del módulo

Debe quedar claro:

- propósito
- frontera funcional
- ownership
- fuera de alcance
- dependencias autorizadas

### 2. Contratos públicos base del módulo

Debe quedar claro cómo exponer, como mínimo:

- regla base de automatización
- trigger mínimo
- condición mínima
- acción automática mínima
- estado base de automatización
- consulta de automatización por contrato público
- mutación base cuando aplique
- restricciones mínimas de acceso asociadas

### 3. Estructura inicial del módulo

El módulo debe encajar en:

```txt
src/features/automation/
```

Con estructura proporcional a su necesidad real y alineada con module-template.md.

### 4. Base de validación

Deben quedar definidos y/o implementados los tests necesarios para proteger:

- contrato del módulo
- trigger, condición y acción mínima
- restricciones base de acceso
- escenarios permitidos y denegados cuando apliquen

---

## Criterios de cierre del sprint

Sprint 10 solo se considera cerrado cuando:

- `automation` tiene responsabilidad funcional clara.
- Existe frontera pública clara del módulo.
- La regla base de automatización no depende de acceso caótico desde UI o páginas.
- El contrato base del módulo está definido con claridad.
- Permisos y tenancy fueron tratados explícitamente.
- El sprint no mezcló trabajo de otros módulos.
- Hay validación suficiente según riesgo.
- El resultado deja base real para procesos posteriores que dependan de automatización.

---

## Tareas del sprint

### Tarea 10.01 - Definir responsabilidad exacta del módulo automation

**Objetivo:**

- fijar qué pertenece al módulo
- fijar qué queda fuera
- fijar ownership funcional

**Salida esperada:**

- definición cerrada del alcance del módulo

### Tarea 10.02 - Definir contrato público base de automation

**Objetivo:**

- establecer qué debe exponer públicamente el módulo
- evitar acceso informal a internals
- preparar consumo controlado desde otros módulos

**Salida esperada:**

- contrato público base documentado o implementado

### Tarea 10.03 - Definir regla base de automatización y estado inicial

**Objetivo:**

- fijar la pieza mínima del dominio de automatización sobre la que crecerá el módulo
- dejar claros su trigger, condición, acción mínima y su estado funcional inicial

**Salida esperada:**

- modelo base del dominio de automatización definido por contrato

### Tarea 10.04 - Validar restricciones base de acceso y tenancy

**Objetivo:**

- asegurar que el contrato inicial no ignora aislamiento multi-tenant
- proteger escenarios permitidos y denegados del dominio de automatización

**Salida esperada:**

- reglas base de acceso asociadas al módulo

### Tarea 10.05 - Definir tests del contrato base del módulo

**Objetivo:**

- asegurar cobertura mínima sobre comportamiento, permisos y límites del módulo

**Salida esperada:**

- cobertura mínima de validación para contrato, tenancy y acceso

### Tarea 10.06 - Revisar el módulo contra arquitectura y definition of done

**Objetivo:**

- asegurar que `automation` queda bien ubicado
- asegurar que no invade otros módulos
- asegurar que el sprint cierra de forma verificable

**Salida esperada:**

- validación estructurada del sprint

---

## Riesgos del sprint

### Riesgo 1. Intentar resolver toda la complejidad del dominio de automatización

- **Mitigación:** limitar el sprint al contrato base y a la regla mínima del módulo

### Riesgo 2. Mezclar automation con notifications, integrations, reporting o lógica fuente de otros módulos

- **Mitigación:** mantener ownership estricto y no introducir lógica de otros dominios dentro del módulo

### Riesgo 3. Acabar con un módulo ambiguo o demasiado abstracto

- **Mitigación:** exigir contratos concretos, entradas claras y salidas claras

### Riesgo 4. Ignorar multi-tenant al definir automatizaciones

- **Mitigación:** tratar tenant y permisos como parte obligatoria del contrato base

### Riesgo 5. Poner lógica de automatización en páginas, layouts o componentes

- **Mitigación:** concentrar la lógica del módulo en `src/features/automation/` y exponer frontera pública

---

## Validación del sprint

Antes de cerrar Sprint 10, debe poder responderse:

- ¿está claro qué pertenece a `automation`?
- ¿el resto del sistema puede consumir `automation` sin invadir internals?
- ¿la regla base de automatización y su estado inicial tienen contrato claro?
- ¿permisos y tenancy fueron considerados explícitamente?
- ¿el sprint evitó mezclar tareas de otros módulos?
- ¿hay tests proporcionales al riesgo?
- ¿la base creada permite avanzar al siguiente sprint sin caos?

Si alguna respuesta crítica es no, Sprint 10 no está cerrado.

---

## Definition of Done del sprint

Sprint 10 está done solo cuando:

- el módulo `automation` tiene frontera clara
- el contrato base del módulo existe y es comprensible
- la regla base de automatización está tratada como concern oficial del módulo
- permisos y multi-tenant fueron contemplados cuando aplicaban
- el trabajo respeta arquitectura, workflow y standards
- no se mezcló rediseño global ni trabajo lateral
- el sprint deja una salida concreta, verificable y reutilizable

---

## Preparación para sprints posteriores

Una vez cerrado Sprint 10, el proyecto debería quedar listo para que módulos posteriores puedan consumir `automation` con un contrato estable, en lugar de resolver reglas automáticas de forma dispersa.

Los siguientes sprints deberán construirse sobre esta base, no rodearla.

---

## Estado de este documento

Este archivo define el Sprint 10 oficial del módulo `automation` en ChefOS v3.

Su función es continuar la fase funcional del proyecto con un alcance pequeño, controlado y compatible con la arquitectura oficial.

---

## Detalle específico del dominio (heredado de v2)

Absorbe `docs/MODULO_AUTOMATIZACIONES.md` de v2. Migración `00021_m8_automation` + security hardening `00024_security_fixes` + `00049_fix_internal_rpcs_grants`.

### Funcionalidades principales

**Infraestructura de jobs queue + worker Edge Function**, sobre la que se apoyan otros módulos:

- `automation_jobs` queue con estados (queued|running|completed|failed|cancelled).
- Worker Edge Function toma jobs con `claim_next_job`, los procesa, marca `complete_job` o `fail_job` con backoff.
- Backoff exponencial con cap 120min (migración 00024).
- Triggers que encolan jobs: `evento.confirmed` → `generate_event_workflow`; `evento.completed` → `run_agent(post_event)`, etc.

**Automatizaciones asistidas** (agentes viven en sprint-14; aquí solo la infraestructura):

- Sugerencias de pedido anticipado (stock proyectado < necesidad futura).
- Alertas predictivas (riesgo falta de producto, proveedor crítico).
- Recomendaciones operativas (ajuste producción, priorización consumo).

### Modelo de datos

- `AutomationJob` — hotel_id, job_type, payload (jsonb), status, attempts, max_attempts, backoff_until, error_message, claimed_at, claimed_by, started_at, completed_at.
- `AutomationJobLog` — job_id, level, message, created_at.
- `AutomationTrigger` — hotel_id, event_type, action (cuándo disparar qué).

### Contratos públicos (`src/features/automation/index.ts`)

Types: `AutomationJob`, `AutomationJobLog`, `AutomationTrigger`, `JobType`, `JobStatus`, `JOB_TYPES`, `JOB_STATUS_VARIANT`.

Hooks:
- `useAutomationJobs(filters?)` — panel admin
- `useJobLogs(jobId)`
- `useEnqueueJob()` — solo admin+
- `useCancelJob()`
- `useTriggers()`, `useUpdateTrigger()`

### Casos de uso (`application/`)

- `use-automation.ts`, `use-automation-jobs.ts`, `use-job-logs.ts`
- `use-enqueue-job.ts`, `use-cancel-job.ts`
- `use-triggers.ts`

### RPCs consumidas

Service-only (worker invoca, REVOKE authenticated, 00049):
- `enqueue_job(p_hotel_id, p_job_type, p_payload, p_run_after)` — validaciones: whitelist job_type, config activa
- `claim_next_job(p_worker_id)` — `SELECT FOR UPDATE SKIP LOCKED`
- `complete_job(p_job_id, p_result)`
- `fail_job(p_job_id, p_error, p_retry)` — calcula backoff
- `cancel_job(p_job_id)`

User-facing (todos los miembros según permissions-matrix):
- `get_pending_jobs(p_hotel_id)`
- `get_job_logs(p_job_id)`

### Edge Function

`automation-worker`:
- Validar `Authorization: Bearer <service_role>`.
- Loop: claim → process → complete/fail.
- Backoff respeta `Retry-After` si aplica.
- Timeout por tipo de job.
- Logs atómicos a `automation_job_logs`.

### Job types oficiales (whitelist)

- `generate_event_workflow` — tras `evento.confirmed`
- `sync_pms` — integración PMS (sprint-12)
- `sync_pos` — integración POS (sprint-12)
- `ocr_receipt` — OCR albarán (sprint-05)
- `run_agent` — ejecución de agente IA (sprint-14)
- `generate_daily_snapshot` — KPI snapshot (sprint-08)
- `generate_recurring_tasks` — tareas recurrentes (sprint-07)
- `send_notification_email` — digest email (sprint-11)

Añadir un job_type nuevo requiere whitelist update + ADR en `decisions-log.md`.

### Eventos de dominio

Emite: `automation.job_enqueued`, `automation.job_started`, `automation.job_completed`, `automation.job_failed`, `automation.job_cancelled`.

Consume: eventos que disparan triggers → `evento.confirmed`, `evento.completed`, `pedido.received_complete`, etc.

### Tests mínimos

Unit: backoff exponencial con cap, state machine job transitions.

Integration: claim_next_job atómico (2 workers no toman el mismo job), whitelist rechaza job_type inválido.

E2E: confirmar evento → job `generate_event_workflow` encolado → worker procesa → workflow existe.

### Criterio de done específico

- [ ] Claim atómico verificado con concurrencia (2 workers simultáneos).
- [ ] Backoff respeta Retry-After; sin backoff >120min.
- [ ] Todos los job_type en whitelist + validación config activa.
- [ ] Worker valida Authorization antes de crear cliente service_role.
- [ ] Logs atómicos (si el worker crashea mid-job, el log queda visible).
- [ ] Panel admin muestra jobs + logs sin exponer payload sensible.

### Referencias cruzadas

- Infraestructura consumida por: sprint-02 (BEO PDF), sprint-05 (OCR), sprint-07 (workflow), sprint-08 (snapshot), sprint-11 (email), sprint-12 (sync), sprint-14 (agents)
- `specs/database-security.md` (SECURITY DEFINER worker RPCs, REVOKE/GRANT)
- `skills/automation/`
