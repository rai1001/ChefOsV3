# ChefOS v3 Sprint 14 - Agents

## Objetivo del sprint

Construir la base funcional inicial del módulo `agents` dentro de la arquitectura oficial de ChefOS v3, con alcance cerrado y orientado a estabilizar el contrato base del dominio de agentes del sistema.

Este sprint no existe para resolver toda la estrategia de agentes del producto.

Existe para definir y estabilizar la primera base operativa del módulo `agents`.

---

## Estado del sprint

- Módulo principal: `agents`
- Tipo de sprint: funcional
- Alcance: pequeño y cerrado
- Dependencias directas:
  - `sprint-00-foundation`
  - `sprint-01-identity`
- Multi-tenant, permisos y límites de módulo: obligatorios
- Regla crítica del módulo: agentes asistidos, no autónomos

---

## Propósito del módulo `agents`

El módulo `agents` es responsable del dominio de agentes dentro del sistema.

Debe actuar como owner de los contratos relacionados con:

- definición base de agente
- configuración mínima de agente
- ejecución asistida mínima
- contexto mínima de ejecución
- estado base de agente
- restricciones mínimas de intervención humana
- contratos públicos que otros módulos puedan consumir sin invadir internals

No debe convertirse en owner de automatizaciones genéricas, integraciones externas, identidad o lógica fuente de otros módulos.

---

## Objetivo funcional exacto del sprint

Dejar definido e implementable el contrato base de `agents` para que el sistema pueda manejar, de forma explícita y controlada:

- la entidad base de agente del dominio
- su configuración mínima
- su ejecución asistida mínima
- su estado funcional inicial
- el acceso controlado a esa información desde otros módulos
- la frontera pública del módulo sin acceso caótico desde UI o páginas

---

## Resultado esperado

Al cerrar este sprint, el proyecto debe tener una primera base clara para `agents` que permita:

- encapsular la lógica mínima del dominio de agentes
- exponer contratos públicos base del módulo
- evitar acceso caótico a agentes desde páginas o componentes
- preparar el terreno para procesos posteriores que dependan de agentes
- permitir que futuros módulos consuman `agents` mediante contrato público claro
- reforzar explícitamente la regla de agentes asistidos, no autónomos

---

## Alcance del sprint

### Incluye

- definición del ownership del módulo `agents`
- definición de frontera pública del módulo
- definición de contratos base del dominio de agentes
- definición de inputs y outputs mínimos del módulo
- diseño cerrado de la entidad base de agente y su estado inicial
- definición mínima de intervención o control humano
- validación de restricciones base de acceso cuando aplique
- tests necesarios para el contrato base del módulo

### No incluye

- automatización autónoma de procesos
- integraciones externas complejas de agentes
- orquestación avanzada multi-agente
- sistema completo de prompting o memoria operativa
- reporting transversal de agentes
- rediseño global de la estrategia AI del producto
- migración masiva de legacy de `agents`
- cambios funcionales en módulos no relacionados

---

## Módulo afectado

- `agents`

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
- integrations
- hr

### Dependencia permitida

- `identity`, solo para contexto de usuario, tenant y permisos base si aplica

---

## Problemas que este sprint sí debe resolver

1. Definir qué pertenece realmente a `agents`.
2. Evitar acceso improvisado a agentes desde cualquier parte del sistema.
3. Fijar el contrato base que otros módulos podrán consumir.
4. Obligar a que datos, permisos y tenant del dominio de `agents` se traten de forma explícita.
5. Reforzar que el módulo opera bajo control humano y no bajo autonomía libre.
6. Sentar una base revisable y testeable para crecimiento posterior.

---

## Problemas que este sprint no debe intentar resolver

1. Toda la estrategia de agentes del sistema.
2. Toda la relación entre `agents` y `automation`.
3. Toda la relación entre `agents` e `integrations`.
4. Toda la analítica asociada a agentes.
5. Toda la memoria operativa o personalización avanzada de agentes.
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

Los entregables esperados de Sprint 14 son los mínimos necesarios para dejar una base estable del módulo `agents`.

### 1. Definición operativa del módulo

Debe quedar claro:

- propósito
- frontera funcional
- ownership
- fuera de alcance
- dependencias autorizadas
- regla de control humano obligatoria

### 2. Contratos públicos base del módulo

Debe quedar claro cómo exponer, como mínimo:

- entidad base de agente
- configuración mínima
- ejecución asistida mínima
- estado base de agente
- consulta de agente por contrato público
- mutación base cuando aplique
- restricciones mínimas de acceso asociadas

### 3. Estructura inicial del módulo

El módulo debe encajar en:

```txt
src/features/agents/
```

Con estructura proporcional a su necesidad real y alineada con module-template.md.

### 4. Base de validación

Deben quedar definidos y/o implementados los tests necesarios para proteger:

- contrato del módulo
- configuración y ejecución mínima del agente
- restricciones base de acceso
- escenarios permitidos y denegados cuando apliquen
- presencia de intervención o control humano cuando corresponda

---

## Criterios de cierre del sprint

Sprint 14 solo se considera cerrado cuando:

- `agents` tiene responsabilidad funcional clara.
- Existe frontera pública clara del módulo.
- La entidad base de agente no depende de acceso caótico desde UI o páginas.
- El contrato base del módulo está definido con claridad.
- Permisos y tenancy fueron tratados explícitamente.
- La regla de agentes asistidos, no autónomos, quedó explícitamente reflejada.
- El sprint no mezcló trabajo de otros módulos.
- Hay validación suficiente según riesgo.
- El resultado deja base real para procesos posteriores que dependan de agentes.

---

## Tareas del sprint

### Tarea 14.01 - Definir responsabilidad exacta del módulo agents

**Objetivo:**

- fijar qué pertenece al módulo
- fijar qué queda fuera
- fijar ownership funcional

**Salida esperada:**

- definición cerrada del alcance del módulo

### Tarea 14.02 - Definir contrato público base de agents

**Objetivo:**

- establecer qué debe exponer públicamente el módulo
- evitar acceso informal a internals
- preparar consumo controlado desde otros módulos

**Salida esperada:**

- contrato público base documentado o implementado

### Tarea 14.03 - Definir entidad base de agente y estado inicial

**Objetivo:**

- fijar la pieza mínima del dominio de agentes sobre la que crecerá el módulo
- dejar claros su configuración mínima, su ejecución asistida y su estado funcional inicial

**Salida esperada:**

- modelo base del dominio de `agents` definido por contrato

### Tarea 14.04 - Definir restricción mínima de control humano

**Objetivo:**

- asegurar que la base del módulo no deriva en autonomía no controlada
- dejar explícita la intervención, supervisión o validación humana cuando aplique

**Salida esperada:**

- regla mínima de control humano asociada al módulo

### Tarea 14.05 - Validar restricciones base de acceso y tenancy

**Objetivo:**

- asegurar que el contrato inicial no ignora aislamiento multi-tenant
- proteger escenarios permitidos y denegados del dominio de `agents`

**Salida esperada:**

- reglas base de acceso asociadas al módulo

### Tarea 14.06 - Definir tests del contrato base del módulo

**Objetivo:**

- asegurar cobertura mínima sobre comportamiento, permisos y límites del módulo

**Salida esperada:**

- cobertura mínima de validación para contrato, tenancy, acceso y control humano

### Tarea 14.07 - Revisar el módulo contra arquitectura y definition of done

**Objetivo:**

- asegurar que `agents` queda bien ubicado
- asegurar que no invade otros módulos
- asegurar que el sprint cierra de forma verificable

**Salida esperada:**

- validación estructurada del sprint

---

## Riesgos del sprint

### Riesgo 1. Intentar resolver toda la complejidad del dominio de agentes

- **Mitigación:** limitar el sprint al contrato base y a la entidad mínima del módulo

### Riesgo 2. Mezclar agents con automation, integrations, identity o lógica fuente de otros módulos

- **Mitigación:** mantener ownership estricto y no introducir lógica de otros dominios dentro del módulo

### Riesgo 3. Acabar con un módulo ambiguo o demasiado abstracto

- **Mitigación:** exigir contratos concretos, entradas claras y salidas claras

### Riesgo 4. Ignorar multi-tenant al definir agents

- **Mitigación:** tratar tenant y permisos como parte obligatoria del contrato base

### Riesgo 5. Diseñar agentes autónomos sin control humano

- **Mitigación:** reflejar explícitamente intervención, supervisión o validación humana en la base del módulo

### Riesgo 6. Poner lógica de agents en páginas, layouts o componentes

- **Mitigación:** concentrar la lógica del módulo en `src/features/agents/` y exponer frontera pública

---

## Validación del sprint

Antes de cerrar Sprint 14, debe poder responderse:

- ¿está claro qué pertenece a `agents`?
- ¿el resto del sistema puede consumir `agents` sin invadir internals?
- ¿la entidad base de agente y su estado inicial tienen contrato claro?
- ¿permisos y tenancy fueron considerados explícitamente?
- ¿la intervención o supervisión humana quedó tratada de forma explícita?
- ¿el sprint evitó mezclar tareas de otros módulos?
- ¿hay tests proporcionales al riesgo?
- ¿la base creada permite avanzar al siguiente sprint sin caos?

Si alguna respuesta crítica es no, Sprint 14 no está cerrado.

---

## Definition of Done del sprint

Sprint 14 está done solo cuando:

- el módulo `agents` tiene frontera clara
- el contrato base del módulo existe y es comprensible
- la entidad base de agente está tratada como concern oficial del módulo
- permisos y multi-tenant fueron contemplados cuando aplicaban
- la regla de agentes asistidos y no autónomos quedó reflejada
- el trabajo respeta arquitectura, workflow y standards
- no se mezcló rediseño global ni trabajo lateral
- el sprint deja una salida concreta, verificable y reutilizable

---

## Preparación para sprints posteriores

Una vez cerrado Sprint 14, el proyecto debería quedar listo para que módulos posteriores puedan consumir `agents` con un contrato estable, en lugar de resolver asistencia operativa de forma dispersa.

Los siguientes sprints deberán construirse sobre esta base, no rodearla.

---

## Estado de este documento

Este archivo define el Sprint 14 oficial del módulo `agents` en ChefOS v3.

Su función es continuar la fase funcional del proyecto con un alcance pequeño, controlado y compatible con la arquitectura oficial.

---

## Detalle específico del dominio (heredado de v2)

Absorbe `MODULO_AUTOMATIZACIONES.md` + estado v2 de agentes M15. Migración `00027_m15_agents` + security hardening `00028_security_hardening` (REVOKE EXECUTE run_*_agent to authenticated).

### Funcionalidades principales

**Asistidos, no autónomos**: los agentes analizan datos y **sugieren**. El humano aprueba/rechaza. Cada sugerencia puede disparar acción (encolar job, crear alerta, etc.) tras aprobación.

**10 agentes de automejora** (análisis/sugerencia):
1. `price_watcher` — detecta subidas recurrentes por producto/proveedor
2. `waste_analyzer` — patrones de merma (recetas con sobreproducción, motivos recurrentes)
3. `stock_optimizer` — sugerir aumentar/reducir stock mínimo por producto
4. `recipe_cost_alert` — recetas con food cost > objetivo
5. `compliance_reminder` — registros APPCC pendientes / temperaturas no logueadas
6. `event_planner` — pre-evento: chequeo de ingredientes, producción, personal
7. `shopping_optimizer` — sugerir consolidar pedidos vs múltiples proveedores
8. `kds_coordinator` — durante servicio: tiempos de preparación, cuellos de botella
9. `post_event` — post-mortem automático: food cost real vs estimado, mermas, incidencias
10. `forecast_prep` — previsión de demanda para próxima semana

**5 agentes de coordinación evento** (solo tras `evento.confirmed|completed`):
- Pre-evento: event_planner + shopping_optimizer + compliance_reminder
- Post-evento: post_event + waste_analyzer

### Modelo de datos

- `AgentConfig` — hotel_id, agent_type, enabled, schedule (cron expression opcional), parameters (jsonb).
- `AgentSuggestion` — hotel_id, agent_type, created_at, payload (jsonb), action_type, status (pending|approved|rejected|expired), reviewed_by, reviewed_at, outcome.

### State machine (AgentSuggestion)

`pending → approved → executed` (o `pending → rejected`) (+ `expired` si pasa ventana sin revisión).

### Contratos públicos (`src/features/agents/index.ts`)

Types: `AgentConfig`, `AgentSuggestion`, `AgentType`, `SuggestionStatus`, `SuggestionAction`, `AGENT_TYPES`, `SUGGESTION_STATUS_VARIANT`, `SUGGESTION_STATUS_LABELS`.

Hooks:
- `useAgentSuggestions(filters?)`, `useAgentSuggestion(id)`
- `useApproveSuggestion()`, `useRejectSuggestion()`
- `useAgentConfigs()`, `useUpsertAgentConfig()` (admin+ recomendado; UI gating por ahora)
- `useRunAgent(agentType)` — admin+, fuerza ejecución manual

### Casos de uso (`application/`)

- `use-agents.ts`, `use-agent-suggestions.ts`, `use-agent-suggestion.ts`
- `use-approve-suggestion.ts`, `use-reject-suggestion.ts`
- `use-agent-configs.ts`, `use-upsert-agent-config.ts`
- `use-run-agent.ts`

### RPCs consumidas

Service-only (REVOKE public, anon, authenticated — 00028):
- `run_price_watcher_agent`, `run_waste_analyzer_agent`, `run_stock_optimizer_agent`, `run_recipe_cost_alert_agent`, `run_compliance_reminder_agent`
- `run_event_planner_agent`, `run_shopping_optimizer_agent`, `run_kds_coordinator_agent`, `run_post_event_agent`, `run_forecast_prep_agent`
- `run_all_automejora_agents` (worker utility)
- `_create_agent_suggestion` (helper interno)

Ejecución:
- Desde worker vía job `run_agent` con payload `{ agent_type, hotel_id }`.

User-facing (todos los miembros con check_membership, 00028 REVOKE emit_event a authenticated):
- `get_agent_suggestions`, `get_agent_configs`
- `approve_suggestion(p_suggestion_id)` — whitelist acciones para enqueue (00030 + fix contrato sync_recipe_costs)
- `reject_suggestion(p_suggestion_id, p_reason)`
- `upsert_agent_config(p_agent_type, p_enabled, p_schedule, p_parameters)`

### Triggers automáticos

- `evento.confirmed` → encola job `run_agent(event_planner)` + `run_agent(shopping_optimizer)` + `run_agent(compliance_reminder)`
- `evento.completed` → encola `run_agent(post_event)` + `run_agent(waste_analyzer)`
- Cron diario → encola `run_all_automejora_agents`

### Eventos de dominio

Emite: `agent.suggestion_created`, `agent.suggestion_approved` (dispara acción derivada), `agent.suggestion_rejected`.

Consume: eventos que dispiaran triggers (arriba).

### Tests mínimos

Unit: state machine suggestion, expiración automática (suggestions >7 días sin review → expired).

Integration: approve_suggestion solo dispara acciones del whitelist (seguridad contra payload arbitrario), REVOKE run_*_agent rechaza invocación authenticated.

E2E: confirmar evento → esperar job → ver suggestion `event_planner` en `/agents` → aprobar → verificar acción derivada encolada.

### Criterio de done específico

- [ ] 10 agentes automejora + 5 coordinación evento configurados por hotel al onboarding.
- [ ] Seed 10 agent_configs hotel test (ver v2 migración 00027).
- [ ] `approve_suggestion` whitelist valida acción antes de encolar.
- [ ] Sugerencias expired automáticamente tras 7 días (configurable).
- [ ] `run_*_agent` REVOKE verificado: llamada authenticated rechazada.
- [ ] Panel `/agents` muestra sugerencias pending + config.
- [ ] Agentes son **asistidos**: ninguno ejecuta acción sin approve explícito.

### Regla de oro (no negociable)

Los agentes **nunca** ejecutan acciones de negocio de forma autónoma. Solo proponen. El humano aprueba. Si se encuentra un trigger que auto-ejecuta acciones basándose solo en output de agente → bloquear merge hasta refactor.

### Referencias cruzadas

- `specs/core-constraints.md` — principio "Asistido NO autónomo"
- `specs/database-security.md` — REVOKE/GRANT para run_*_agent
- `specs/permissions-matrix.md` — agentes M15 post-Codex
- `sprints/sprint-10-automation.md` — worker ejecuta jobs run_agent
- `sprints/sprint-11-notifications.md` — nuevas suggestions notifican al admin
- `sprints/sprint-08-reporting.md` — dashboard muestra count de suggestions pending
- `skills/agents/`
