# ChefOS v3 Sprint 07 - Production

## Objetivo del sprint

Construir la base funcional inicial del módulo `production` dentro de la arquitectura oficial de ChefOS v3, con alcance cerrado y orientado a estabilizar el contrato base del dominio de producción del sistema.

Este sprint no existe para resolver toda la operativa productiva del producto.

Existe para definir y estabilizar la primera base operativa del módulo `production`.

---

## Estado del sprint

- Módulo principal: `production`
- Tipo de sprint: funcional
- Alcance: pequeño y cerrado
- Dependencias directas:
  - `sprint-00-foundation`
  - `sprint-01-identity`
- Multi-tenant, permisos y límites de módulo: obligatorios

---

## Propósito del módulo `production`

El módulo `production` es responsable del dominio de producción dentro del sistema.

Debe actuar como owner de los contratos relacionados con:

- orden base de producción
- estado base de ejecución productiva
- datos mínimos operativos del proceso de producción
- transformaciones operativas mínimas cuando apliquen al contrato base
- reglas mínimas de validación del dominio
- contratos públicos que otros módulos puedan consumir sin invadir internals

No debe convertirse en owner de lógica de recipes, inventory, procurement o automation.

---

## Objetivo funcional exacto del sprint

Dejar definido e implementable el contrato base de `production` para que el sistema pueda manejar, de forma explícita y controlada:

- la entidad base de producción del dominio
- su estado funcional inicial
- sus datos mínimos operativos
- el acceso controlado a esa información desde otros módulos
- la frontera pública del módulo sin acceso caótico desde UI o páginas

---

## Resultado esperado

Al cerrar este sprint, el proyecto debe tener una primera base clara para `production` que permita:

- encapsular la lógica mínima del dominio de producción
- exponer contratos públicos base del módulo
- evitar acceso caótico a producción desde páginas o componentes
- preparar el terreno para procesos posteriores que dependan de producción
- permitir que futuros módulos consuman `production` mediante contrato público claro

---

## Alcance del sprint

### Incluye

- definición del ownership del módulo `production`
- definición de frontera pública del módulo
- definición de contratos base del dominio de producción
- definición de inputs y outputs mínimos del módulo
- diseño cerrado de la entidad base de producción y su estado inicial
- validación de restricciones base de acceso cuando aplique
- tests necesarios para el contrato base del módulo

### No incluye

- formulación completa de recetas
- control completo de stock
- flujo completo de compras o abastecimiento
- automatizaciones de producción
- reporting transversal de producción
- integraciones externas de producción
- planificación avanzada de producción
- migración masiva de legacy de production
- cambios funcionales en módulos no relacionados

---

## Módulo afectado

- `production`

### Módulos no objetivo en este sprint

No deben tocarse funcionalmente salvo dependencia mínima y explícita:

- commercial
- recipes
- catalog
- procurement
- inventory
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

1. Definir qué pertenece realmente a `production`.
2. Evitar acceso improvisado a datos de producción desde cualquier parte del sistema.
3. Fijar el contrato base que otros módulos podrán consumir.
4. Obligar a que datos, permisos y tenant del dominio de producción se traten de forma explícita.
5. Sentar una base revisable y testeable para crecimiento posterior.

---

## Problemas que este sprint no debe intentar resolver

1. Todo el flujo completo de producción del sistema.
2. Toda la relación entre production y recipes.
3. Toda la relación entre production e inventory.
4. Toda la automatización asociada a ejecución productiva.
5. Integraciones externas del dominio de producción.
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

Los entregables esperados de Sprint 07 son los mínimos necesarios para dejar una base estable del módulo `production`.

### 1. Definición operativa del módulo

Debe quedar claro:

- propósito
- frontera funcional
- ownership
- fuera de alcance
- dependencias autorizadas

### 2. Contratos públicos base del módulo

Debe quedar claro cómo exponer, como mínimo:

- entidad base de producción
- estado base de ejecución productiva
- consulta de entidad de producción por contrato público
- mutación base cuando aplique
- restricciones mínimas de acceso asociadas

### 3. Estructura inicial del módulo

El módulo debe encajar en:

```txt
src/features/production/
```

Con estructura proporcional a su necesidad real y alineada con module-template.md.

### 4. Base de validación

Deben quedar definidos y/o implementados los tests necesarios para proteger:

- contrato del módulo
- datos mínimos de producción
- restricciones base de acceso
- escenarios permitidos y denegados cuando apliquen

---

## Criterios de cierre del sprint

Sprint 07 solo se considera cerrado cuando:

- `production` tiene responsabilidad funcional clara.
- Existe frontera pública clara del módulo.
- La entidad base de producción no depende de acceso caótico desde UI o páginas.
- El contrato base del módulo está definido con claridad.
- Permisos y tenancy fueron tratados explícitamente.
- El sprint no mezcló trabajo de otros módulos.
- Hay validación suficiente según riesgo.
- El resultado deja base real para procesos posteriores que dependan de producción.

---

## Tareas del sprint

### Tarea 07.01 - Definir responsabilidad exacta del módulo production

**Objetivo:**

- fijar qué pertenece al módulo
- fijar qué queda fuera
- fijar ownership funcional

**Salida esperada:**

- definición cerrada del alcance del módulo

### Tarea 07.02 - Definir contrato público base de production

**Objetivo:**

- establecer qué debe exponer públicamente el módulo
- evitar acceso informal a internals
- preparar consumo controlado desde otros módulos

**Salida esperada:**

- contrato público base documentado o implementado

### Tarea 07.03 - Definir entidad base de producción y estado inicial

**Objetivo:**

- fijar la pieza mínima del dominio de producción sobre la que crecerá el módulo
- dejar claros sus datos mínimos y su estado funcional inicial

**Salida esperada:**

- modelo base del dominio de producción definido por contrato

### Tarea 07.04 - Validar restricciones base de acceso y tenancy

**Objetivo:**

- asegurar que el contrato inicial no ignora aislamiento multi-tenant
- proteger escenarios permitidos y denegados del dominio de producción

**Salida esperada:**

- reglas base de acceso asociadas al módulo

### Tarea 07.05 - Definir tests del contrato base del módulo

**Objetivo:**

- asegurar cobertura mínima sobre comportamiento, permisos y límites del módulo

**Salida esperada:**

- cobertura mínima de validación para contrato, tenancy y acceso

### Tarea 07.06 - Revisar el módulo contra arquitectura y definition of done

**Objetivo:**

- asegurar que `production` queda bien ubicado
- asegurar que no invade otros módulos
- asegurar que el sprint cierra de forma verificable

**Salida esperada:**

- validación estructurada del sprint

---

## Riesgos del sprint

### Riesgo 1. Intentar resolver toda la complejidad del dominio de producción

- **Mitigación:** limitar el sprint al contrato base y a la entidad mínima del módulo

### Riesgo 2. Mezclar production con recipes, inventory, procurement o automation

- **Mitigación:** mantener ownership estricto y no introducir lógica de otros dominios dentro del módulo

### Riesgo 3. Acabar con un módulo ambiguo o demasiado abstracto

- **Mitigación:** exigir contratos concretos, entradas claras y salidas claras

### Riesgo 4. Ignorar multi-tenant al definir producción

- **Mitigación:** tratar tenant y permisos como parte obligatoria del contrato base

### Riesgo 5. Poner lógica de producción en páginas, layouts o componentes

- **Mitigación:** concentrar la lógica del módulo en `src/features/production/` y exponer frontera pública

---

## Validación del sprint

Antes de cerrar Sprint 07, debe poder responderse:

- ¿está claro qué pertenece a `production`?
- ¿el resto del sistema puede consumir `production` sin invadir internals?
- ¿la entidad base de producción y su estado inicial tienen contrato claro?
- ¿permisos y tenancy fueron considerados explícitamente?
- ¿el sprint evitó mezclar tareas de otros módulos?
- ¿hay tests proporcionales al riesgo?
- ¿la base creada permite avanzar al siguiente sprint sin caos?

Si alguna respuesta crítica es no, Sprint 07 no está cerrado.

---

## Definition of Done del sprint

Sprint 07 está done solo cuando:

- el módulo `production` tiene frontera clara
- el contrato base del módulo existe y es comprensible
- la entidad base de producción está tratada como concern oficial del módulo
- permisos y multi-tenant fueron contemplados cuando aplicaban
- el trabajo respeta arquitectura, workflow y standards
- no se mezcló rediseño global ni trabajo lateral
- el sprint deja una salida concreta, verificable y reutilizable

---

## Preparación para sprints posteriores

Una vez cerrado Sprint 07, el proyecto debería quedar listo para que módulos posteriores puedan consumir `production` con un contrato estable, en lugar de resolver ejecución productiva de forma dispersa.

Los siguientes sprints deberán construirse sobre esta base, no rodearla.

---

## Estado de este documento

Este archivo define el Sprint 07 oficial del módulo `production` en ChefOS v3.

Su función es continuar la fase funcional del proyecto con un alcance pequeño, controlado y compatible con la arquitectura oficial.

---

## Detalle específico del dominio (heredado de v2)

Absorbe `docs/MODULO_PRODUCCION.md` + input de `skills/production-module-improvements/` (10 mejoras priorizadas MVP 1/2/3). Migraciones: `00010_m6_production` + `00017_m6_workflows_kds` + fix `00037_fix_workflow_ingredient_name`.

### Funcionalidades principales

- **Production plans** base (manual).
- **Workflows**: auto-generados al confirmar evento (`generate_event_workflow`).
- **Tasks**: state machine pendiente→en_proceso→done + bloqueada (con motivo). Tipos: elaboracion, operativa, control (ver skill production-module-improvements).
- **Mise en place lists/items**: checklists por partida (caliente, fría, pastelería).
- **Kitchen orders (KDS)**: polling 10s, pantalla táctil con botones grandes, status por item.
- **Kanban**: vista jefe con columnas To-do / Doing / Done.
- **Shopping list**: generada por fecha con cantidades escaladas.
- **Recurring task templates**: "Apertura turno mañana", "Cierre de cocina".
- **Anti-abuso móvil**: no permitir Done sin pasar por En proceso, timestamps obligatorios.
- **Historial**: quién crea, quién ejecuta, cuándo inicia/termina, re-aperturas.

### Modelo de datos

- `ProductionPlan` — hotel_id, fecha, turno, estado.
- `ProductionTask` — plan_id, tipo (elaboracion|operativa|control), receta_id (si elaboracion), cantidad_objetivo, estado, assigned_to, hora_inicio, hora_fin, bloqueada_por_tarea_id.
- `TaskChecklist` — task_id, items[] (subtareas con checkbox).
- `Workflow` — hotel_id, evento_id, fecha, estado.
- `WorkflowTask` — workflow_id, task_id, orden.
- `MiseEnPlaceList` — hotel_id, fecha, partida, turno.
- `MiseEnPlaceItem` — list_id, receta_id | producto_id, cantidad, estado.
- `KitchenOrder` — hotel_id, station, evento_id, fecha_servicio.
- `KitchenOrderItem` — ko_id, receta_id, cantidad, estado (pending|in_prep|done|served), pax, notes.
- `RecurringTaskTemplate` — hotel_id, nombre, frecuencia, partida, turno, checklist.

### Contratos públicos (`src/features/production/index.ts`)

Types: `ProductionPlan`, `ProductionTask`, `TaskChecklist`, `Workflow`, `WorkflowTask`, `MiseEnPlaceList`, `MiseEnPlaceItem`, `KitchenOrder`, `KitchenOrderItem`, `RecurringTaskTemplate`, `TASK_TYPES`, `TASK_STATES`, `KO_ITEM_STATES`, `PLAN_STATUS_VARIANT`.

Hooks:

- `useProductionPlans(date?)`, `useProductionPlan(id)`
- `useWorkflow(eventoId)`, `useWorkflowDetail(id)`
- `useTasks(filters?)`, `useTransitionTask()`, `useMarkTaskBlocked()`
- `useMiseEnPlaceLists(date)`, `useMarkMEPItem()`
- `useKitchenOrders(station)`, `useUpdateKOItemStatus()`
- `useKanban(date?)`
- `useShoppingList(date)` — generada automática
- `useGenerateRecurringTasks()`, `useTaskChecklist(taskId)`

### Casos de uso (`application/`)

- `use-production.ts`, `use-plans.ts`, `use-tasks.ts`
- `use-workflow.ts`, `use-workflow-detail.ts`
- `use-mise-en-place.ts`, `use-mark-mep-item.ts`
- `use-kitchen-orders.ts`, `use-update-ko-item-status.ts`
- `use-kanban.ts`, `use-shopping-list.ts`
- `use-transition-task.ts`, `use-mark-task-blocked.ts`

### RPCs consumidas

- `generate_production_plan`, `generate_event_workflow(p_evento_id)`
- `transition_task(p_task_id, p_to_state)` — state machine + timestamps
- `mark_task_blocked(p_task_id, p_blocked_by, p_reason)`
- `get_workflow_detail(p_workflow_id)`
- `generate_shopping_list(p_fecha)` — agrega necesidades por día
- `mark_mep_item(p_item_id, p_status)`
- `create_kitchen_order`, `add_kitchen_order_item` (fix 00048 tenant scope), `update_ko_item_status`
- `generate_recurring_tasks(p_fecha)`

### State machines

TaskState: `pendiente → en_proceso → done` (+ `bloqueada` con motivo + `cancelada`).

Reglas anti-abuso:

- `pendiente → done` directo: BLOQUEADO.
- Timestamp `hora_inicio` en `en_proceso`, `hora_fin` en `done`.
- (MVP 2) Pedir comentario si tiempo real < 20% del estimado.

KOItemState: `pending → in_prep → done → served`.

### Eventos de dominio

Emite: `tarea_produccion.created`, `tarea_produccion.updated` (cambio estado), `workflow.generated`, `mise_en_place.completed`, `kitchen_order.status_changed`.

Consume: `evento.confirmed` (dispara `generate_event_workflow`), `evento.cancelled` (cancela tareas pendientes), `evento.updated` (re-planifica si cambia pax/menú).

### Tests mínimos

Unit: state machine task (bloqueado pendiente→done directo), cálculo shopping list por fecha.

Integration: `generate_event_workflow` crea tasks + MEP + kitchen orders atómicamente, transition con timestamps correcto.

E2E: confirmar evento → workflow generado → cocinero ve tarea en kanban → marca en proceso → cierra done → KDS actualizado.

### Criterio de done específico

- [ ] Workflow completo generado en <2s tras confirmar evento.
- [ ] KDS polling 10s sin lag, status update <500ms.
- [ ] Anti-abuso móvil: direct done bloqueado server-side.
- [ ] Shopping list dedupe cantidades si mismo producto en varias recetas.
- [ ] Kanban drag-drop actualiza estado vía `transition_task`.
- [ ] Recurring tasks se generan al primer acceso del día.

### Referencias cruzadas

- `sprints/sprint-02-commercial.md` — evento.confirmed dispara generación
- `sprints/sprint-03-recipes.md` — recetas escaladas por pax
- `sprints/sprint-06-inventory.md` — salidas de stock en elaboración
- `sprints/sprint-11-notifications.md` — alertas de tarea bloqueada
- `skills/production-module-improvements/` — backlog de mejoras MVP 2/3
- `skills/production/`
