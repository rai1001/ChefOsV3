# ChefOS v3 Sprint 02 - Commercial

## Objetivo del sprint

Construir la base funcional inicial del módulo `commercial` dentro de la arquitectura oficial de ChefOS v3, con alcance cerrado y orientado a estabilizar el contrato base del dominio comercial del sistema.

Este sprint no existe para resolver todo el negocio comercial del producto.

Existe para definir y estabilizar la primera base operativa del módulo `commercial`.

---

## Estado del sprint

- Módulo principal: `commercial`
- Tipo de sprint: funcional
- Alcance: pequeño y cerrado
- Dependencias directas:
  - `sprint-00-foundation`
  - `sprint-01-identity`
- Multi-tenant, permisos y límites de módulo: obligatorios

---

## Propósito del módulo `commercial`

El módulo `commercial` es responsable del dominio comercial del sistema.

Debe actuar como owner de los contratos relacionados con:

- entidades comerciales base
- contexto comercial operativo
- estados comerciales relevantes
- relaciones comerciales necesarias para operación del negocio
- reglas base del dominio comercial
- contratos públicos que otros módulos puedan consumir sin invadir internals

No debe convertirse en owner de lógica de catálogo, reporting, automatización o integraciones.

---

## Objetivo funcional exacto del sprint

Dejar definido e implementable el contrato base de `commercial` para que el sistema pueda manejar, de forma explícita y controlada:

- la entidad comercial base del dominio
- su estado comercial inicial
- sus datos mínimos operativos
- el acceso controlado a esa información desde otros módulos
- la frontera pública del módulo sin acceso caótico desde UI o páginas

---

## Resultado esperado

Al cerrar este sprint, el proyecto debe tener una primera base clara para `commercial` que permita:

- encapsular la lógica mínima del dominio comercial
- exponer contratos públicos base del módulo
- evitar acceso caótico a datos comerciales desde páginas o componentes
- preparar el terreno para flujos comerciales posteriores
- permitir que futuros módulos consuman `commercial` mediante contrato público claro

---

## Alcance del sprint

### Incluye

- definición del ownership del módulo `commercial`
- definición de frontera pública del módulo
- definición de contratos base del dominio comercial
- definición de inputs y outputs mínimos del módulo
- diseño cerrado de la entidad comercial base y su estado inicial
- validación de restricciones base de acceso cuando aplique
- tests necesarios para el contrato base del módulo

### No incluye

- CRM completo
- pipeline comercial completo
- sistema completo de presupuestos o cotizaciones
- reporting comercial transversal
- automatizaciones comerciales
- integraciones comerciales externas
- migración masiva de legacy comercial
- cambios funcionales en módulos no relacionados

---

## Módulo afectado

- `commercial`

### Módulos no objetivo en este sprint

No deben tocarse funcionalmente salvo dependencia mínima y explícita:

- recipes
- catalog
- procurement
- inventory
- production
- reporting
- compliance
- automation
- notifications
- integrations
- hr
- agents

### Dependencia permitida

- `identity`, solo para contexto de usuario, tenant y permisos base si aplica

---

## Problemas que este sprint sí debe resolver

1. Definir qué pertenece realmente a `commercial`.
2. Evitar acceso improvisado a datos comerciales desde cualquier parte del sistema.
3. Fijar el contrato base que otros módulos podrán consumir.
4. Obligar a que datos, permisos y tenant del dominio comercial se traten de forma explícita.
5. Sentar una base revisable y testeable para crecimiento posterior.

---

## Problemas que este sprint no debe intentar resolver

1. Todo el proceso comercial definitivo.
2. Toda la lógica de catálogo comercial.
3. Toda la analítica comercial del sistema.
4. Toda la automatización asociada a ventas o seguimiento.
5. Integraciones externas del área comercial.
6. Reestructuración global de módulos consumidores.

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

Los entregables esperados de Sprint 02 son los mínimos necesarios para dejar una base estable del módulo `commercial`.

### 1. Definición operativa del módulo

Debe quedar claro:

- propósito
- frontera funcional
- ownership
- fuera de alcance
- dependencias autorizadas

### 2. Contratos públicos base del módulo

Debe quedar claro cómo exponer, como mínimo:

- entidad comercial base
- estado comercial base
- consulta de entidad comercial por contrato público
- mutación base cuando aplique
- restricciones mínimas de acceso asociadas

### 3. Estructura inicial del módulo

El módulo debe encajar en:

```txt
src/features/commercial/
```

Con estructura proporcional a su necesidad real y alineada con module-template.md.

### 4. Base de validación

Deben quedar definidos y/o implementados los tests necesarios para proteger:

- contrato del módulo
- datos comerciales mínimos
- restricciones base de acceso
- escenarios permitidos y denegados cuando apliquen

---

## Criterios de cierre del sprint

Sprint 02 solo se considera cerrado cuando:

- `commercial` tiene responsabilidad funcional clara.
- Existe frontera pública clara del módulo.
- La entidad comercial base no depende de acceso caótico desde UI o páginas.
- El contrato base del módulo está definido con claridad.
- Permisos y tenancy fueron tratados explícitamente.
- El sprint no mezcló trabajo de otros módulos.
- Hay validación suficiente según riesgo.
- El resultado deja base real para flujos comerciales posteriores.

---

## Tareas del sprint

### Tarea 02.01 - Definir responsabilidad exacta del módulo commercial

**Objetivo:**

- fijar qué pertenece al módulo
- fijar qué queda fuera
- fijar ownership funcional

**Salida esperada:**

- definición cerrada del alcance del módulo

### Tarea 02.02 - Definir contrato público base de commercial

**Objetivo:**

- establecer qué debe exponer públicamente el módulo
- evitar acceso informal a internals
- preparar consumo controlado desde otros módulos

**Salida esperada:**

- contrato público base documentado o implementado

### Tarea 02.03 - Definir entidad comercial base y estado inicial

**Objetivo:**

- fijar la pieza mínima del dominio comercial sobre la que crecerá el módulo
- dejar claros sus datos mínimos y su estado funcional inicial

**Salida esperada:**

- modelo base del dominio comercial definido por contrato

### Tarea 02.04 - Validar restricciones base de acceso y tenancy

**Objetivo:**

- asegurar que el contrato inicial no ignora aislamiento multi-tenant
- proteger escenarios permitidos y denegados del dominio comercial

**Salida esperada:**

- reglas base de acceso asociadas al módulo

### Tarea 02.05 - Definir tests del contrato base del módulo

**Objetivo:**

- asegurar cobertura mínima sobre comportamiento, permisos y límites del módulo

**Salida esperada:**

- cobertura mínima de validación para contrato, tenancy y acceso

### Tarea 02.06 - Revisar el módulo contra arquitectura y definition of done

**Objetivo:**

- asegurar que `commercial` queda bien ubicado
- asegurar que no invade otros módulos
- asegurar que el sprint cierra de forma verificable

**Salida esperada:**

- validación estructurada del sprint

---

## Riesgos del sprint

### Riesgo 1. Intentar resolver todo el dominio comercial del sistema

- **Mitigación:** limitar el sprint al contrato base y a la entidad comercial mínima del módulo

### Riesgo 2. Mezclar commercial con catálogo, reporting o automatización

- **Mitigación:** mantener ownership estricto y no introducir lógica de otros dominios dentro del módulo

### Riesgo 3. Acabar con un módulo ambiguo o demasiado abstracto

- **Mitigación:** exigir contratos concretos, entradas claras y salidas claras

### Riesgo 4. Ignorar multi-tenant al definir datos comerciales

- **Mitigación:** tratar tenant y permisos como parte obligatoria del contrato base

### Riesgo 5. Poner lógica comercial en páginas, layouts o componentes

- **Mitigación:** concentrar la lógica del módulo en `src/features/commercial/` y exponer frontera pública

---

## Validación del sprint

Antes de cerrar Sprint 02, debe poder responderse:

- ¿está claro qué pertenece a `commercial`?
- ¿el resto del sistema puede consumir `commercial` sin invadir internals?
- ¿la entidad comercial base y su estado inicial tienen contrato claro?
- ¿permisos y tenancy fueron considerados explícitamente?
- ¿el sprint evitó mezclar tareas de otros módulos?
- ¿hay tests proporcionales al riesgo?
- ¿la base creada permite avanzar al siguiente sprint sin caos?

Si alguna respuesta crítica es no, Sprint 02 no está cerrado.

---

## Definition of Done del sprint

Sprint 02 está done solo cuando:

- el módulo `commercial` tiene frontera clara
- el contrato base del módulo existe y es comprensible
- la entidad comercial base está tratada como concern oficial del módulo
- permisos y multi-tenant fueron contemplados cuando aplicaban
- el trabajo respeta arquitectura, workflow y standards
- no se mezcló rediseño global ni trabajo lateral
- el sprint deja una salida concreta, verificable y reutilizable

---

## Preparación para sprints posteriores

Una vez cerrado Sprint 02, el proyecto debería quedar listo para que módulos posteriores puedan consumir `commercial` con un contrato estable, en lugar de resolver datos comerciales de forma dispersa.

Los siguientes sprints deberán construirse sobre esta base, no rodearla.

---

## Estado de este documento

Este archivo define el Sprint 02 oficial del módulo `commercial` en ChefOS v3.

Su función es continuar la fase funcional del proyecto con un alcance pequeño, controlado y compatible con la arquitectura oficial.

---

## Detalle específico del dominio (heredado de v2)

Absorbe la especificación de `docs/MODULO_EVENTOS.md` de v2 y la migración `00003_m1_commercial` + `00018_m1_beo` + fixes posteriores.

### Funcionalidades principales

- Calendario (mensual/semanal) con filtros hotel, sala, tipo, estado.
- CRUD de eventos: datos, pax, salones (multi-selección), cliente, menús.
- Tipos: Comida, Cena, Pensión completa, Cóctel, Coffee break, Otros.
- Estados: Borrador → Confirmado → Cerrado (+ Cancelado desde cualquier estado).
- Salones por hotel, unibles para un mismo evento. **Regla**: un evento es único aunque use varias salas.
- Importación Excel con anti-duplicados (referencia_externa + hotel).
- Menús: cerrados (catálogo) + a petición (PDF/imagen + OCR + revisión manual).
- Servicios múltiples por evento (coffee, cocktail, comida…) con horario propio.
- BEO (Banquet Event Order) PDF con menú, espacios, horarios, alérgenos, coste estimado.
- Integración automática: al confirmar → genera workflow de producción + lista de compras + chequeo de stock.

### Modelo de datos

- `Event` — hotel_id, client_id, nombre, fecha_inicio, fecha_fin, pax, tipo, estado, notas.
- `Room` — hotel_id, nombre, capacidad, unible.
- `EventRoom` — evento_id, sala_id (N:M).
- `EventMenu` — evento_id, menu_id, servicio_tipo, horario.
- `EventService` — evento_id, tipo, horario, menu_id, pax_override.
- `Client` — hotel_id, nombre, contacto, referencia_externa.

### Contratos públicos (`src/features/commercial/index.ts`)

Types: `Event`, `Room`, `EventRoom`, `EventMenu`, `EventService`, `Client`, `EventStatus`, `EventType`, `EVENT_STATUSES`, `EVENT_TYPES`, `EVENT_STATUS_LABELS`, `EVENT_STATUS_VARIANT`.

Hooks:
- `useEvents(filters?)` — lista paginada
- `useEvent(id)` — detalle
- `useCreateEvent()`, `useUpdateEvent()`, `useTransitionEvent()`
- `useEventsCalendar(from, to)` — vista calendario
- `useRooms()`, `useClients()`, `useCreateClient()`
- `useGenerateBEO(eventId)` — dynamic import del PDF

### Casos de uso (`application/`)

- `use-events.ts`, `use-event.ts`, `use-events-calendar.ts`
- `use-create-event.ts`, `use-update-event.ts`, `use-transition-event.ts`
- `use-clients.ts`, `use-create-client.ts`
- `use-rooms.ts`
- `use-generate-beo.ts`

### RPCs consumidas (Supabase compartido)

- `create_event(...)` — 00003 + fix 00050 (tenant scope)
- `update_event(...)`
- `transition_event(p_event_id, p_to_status)` — state machine validada
- `get_events_calendar(p_hotel_id, p_from, p_to)`
- `get_event_beo(p_event_id)` — JSONB completo, 00018 + fix 00035 (missing columns)
- `calculate_event_cost_estimate(p_event_id)` — 00018 + fix 00052 (tenant scope)
- `generate_event_operational_impact(p_event_id)` — impacto en prod/compras/inv
- `generate_event_workflow(p_event_id)` — dispara al confirmar, ver sprint-07

### State machine

```
draft ──→ confirmed ──→ closed
  │           │           │
  └───────────┴───────────┴──→ cancelled
```

Transiciones (trigger DB):
- `draft → confirmed` — requiere ≥1 sala, cliente, fecha futura.
- `confirmed → closed` — solo tras `fecha_fin`.
- `draft/confirmed → cancelled` — requiere motivo.
- `closed` — terminal, no sale.

### Eventos de dominio (ver `specs/domain-events.md`)

Emite: `evento.created`, `evento.updated`, `evento.confirmed` (dispara workflow), `evento.cancelled` (libera reservations), `evento.completed` (post-event analysis).

Consume: `integration.sync_completed` (PMS → ocupación), `inventario.lote_expiring` (alerta si afecta evento próximo).

### Tests mínimos

Unit: state machine (válidas + denegadas), validación pax mínimo, calculate_event_cost_estimate con mocks.

Integration: create_event inserta event + event_rooms atómicamente, transition_event draft→confirmed emite `evento.confirmed`, cross-tenant update denegado.

E2E: flow completo — crear cliente → evento borrador → asignar sala+menú → confirmar → generar BEO PDF → verificar workflow de producción creado.

### Criterio de done específico

Además de `definition-of-done.md`:

- [ ] Los 4 perfiles UX (cocina/oficina/compras/comercial) ven la sección según `permissions-matrix.md`.
- [ ] BEO PDF genera sin crash Turbopack (wrapper `dynamic()` solo en el botón).
- [ ] Calendar carga <1s con 100 eventos.
- [ ] Import Excel anti-duplicado validado.
- [ ] Integración con sprint-07 (production): confirmar evento → workflow generado.

### Referencias cruzadas

- `specs/domain-events.md` — eventos emitidos/consumidos
- `specs/permissions-matrix.md` — quién ve / edita / confirma / cancela
- `sprints/sprint-07-production.md` — consumidor de `evento.confirmed`
- `sprints/sprint-05-procurement.md` — consumidor de necesidades de compra
- `skills/commercial/` — skill de módulo
