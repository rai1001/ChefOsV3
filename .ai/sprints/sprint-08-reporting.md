# ChefOS v3 Sprint 08 - Reporting

## Objetivo del sprint

Construir la base funcional inicial del módulo `reporting` dentro de la arquitectura oficial de ChefOS v3, con alcance cerrado y orientado a estabilizar el contrato base del dominio de reporting del sistema.

Este sprint no existe para resolver toda la analítica operativa o de negocio del producto.

Existe para definir y estabilizar la primera base operativa del módulo `reporting`.

---

## Estado del sprint

- Módulo principal: `reporting`
- Tipo de sprint: funcional
- Alcance: pequeño y cerrado
- Dependencias directas:
  - `sprint-00-foundation`
  - `sprint-01-identity`
- Multi-tenant, permisos y límites de módulo: obligatorios

---

## Propósito del módulo `reporting`

El módulo `reporting` es responsable del dominio de reporting dentro del sistema.

Debe actuar como owner de los contratos relacionados con:

- consulta base de reporting
- agregación mínima de datos analíticos
- estructura mínima de filtros y salidas del módulo
- estado base de generación o exposición de reportes
- reglas mínimas de validación del dominio
- contratos públicos que otros módulos puedan consumir sin invadir internals

No debe convertirse en owner de lógica fuente de commercial, inventory, production o automation.

---

## Objetivo funcional exacto del sprint

Dejar definido e implementable el contrato base de `reporting` para que el sistema pueda manejar, de forma explícita y controlada:

- la consulta base del dominio de reporting
- su salida estructurada mínima
- sus filtros iniciales
- el acceso controlado a esa información desde otros módulos
- la frontera pública del módulo sin acceso caótico desde UI o páginas

---

## Resultado esperado

Al cerrar este sprint, el proyecto debe tener una primera base clara para `reporting` que permita:

- encapsular la lógica mínima del dominio de reporting
- exponer contratos públicos base del módulo
- evitar acceso caótico a reporting desde páginas o componentes
- preparar el terreno para procesos posteriores que dependan de reporting
- permitir que futuros módulos consuman `reporting` mediante contrato público claro

---

## Alcance del sprint

### Incluye

- definición del ownership del módulo `reporting`
- definición de frontera pública del módulo
- definición de contratos base del dominio de reporting
- definición de inputs y outputs mínimos del módulo
- diseño cerrado de la consulta base de reporting y su salida mínima
- validación de restricciones base de acceso cuando aplique
- tests necesarios para el contrato base del módulo

### No incluye

- reporting transversal completo del sistema
- dashboards completos
- analítica avanzada multi-módulo
- automatizaciones de reporting
- integraciones externas de reporting
- reestructuración de lógica fuente de otros módulos
- migración masiva de legacy de reporting
- cambios funcionales en módulos no relacionados

---

## Módulo afectado

- `reporting`

### Módulos no objetivo en este sprint

No deben tocarse funcionalmente salvo dependencia mínima y explícita:

- commercial
- recipes
- catalog
- procurement
- inventory
- production
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

1. Definir qué pertenece realmente a `reporting`.
2. Evitar acceso improvisado a datos analíticos desde cualquier parte del sistema.
3. Fijar el contrato base que otros módulos podrán consumir.
4. Obligar a que datos, permisos y tenant del dominio de reporting se traten de forma explícita.
5. Sentar una base revisable y testeable para crecimiento posterior.

---

## Problemas que este sprint no debe intentar resolver

1. Toda la estrategia analítica del sistema.
2. Toda la relación entre reporting y commercial.
3. Toda la relación entre reporting e inventory o production.
4. Toda la automatización asociada a generación de reportes.
5. Integraciones externas del dominio de reporting.
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

Los entregables esperados de Sprint 08 son los mínimos necesarios para dejar una base estable del módulo `reporting`.

### 1. Definición operativa del módulo

Debe quedar claro:

- propósito
- frontera funcional
- ownership
- fuera de alcance
- dependencias autorizadas

### 2. Contratos públicos base del módulo

Debe quedar claro cómo exponer, como mínimo:

- consulta base de reporting
- estructura mínima de filtros
- salida estructurada base del reporte
- consulta de reporte por contrato público
- restricciones mínimas de acceso asociadas

### 3. Estructura inicial del módulo

El módulo debe encajar en:

```txt
src/features/reporting/
```

Con estructura proporcional a su necesidad real y alineada con module-template.md.

### 4. Base de validación

Deben quedar definidos y/o implementados los tests necesarios para proteger:

- contrato del módulo
- filtros y salida mínima de reporting
- restricciones base de acceso
- escenarios permitidos y denegados cuando apliquen

---

## Criterios de cierre del sprint

Sprint 08 solo se considera cerrado cuando:

- `reporting` tiene responsabilidad funcional clara.
- Existe frontera pública clara del módulo.
- La consulta base de reporting no depende de acceso caótico desde UI o páginas.
- El contrato base del módulo está definido con claridad.
- Permisos y tenancy fueron tratados explícitamente.
- El sprint no mezcló trabajo de otros módulos.
- Hay validación suficiente según riesgo.
- El resultado deja base real para procesos posteriores que dependan de reporting.

---

## Tareas del sprint

### Tarea 08.01 - Definir responsabilidad exacta del módulo reporting

**Objetivo:**

- fijar qué pertenece al módulo
- fijar qué queda fuera
- fijar ownership funcional

**Salida esperada:**

- definición cerrada del alcance del módulo

### Tarea 08.02 - Definir contrato público base de reporting

**Objetivo:**

- establecer qué debe exponer públicamente el módulo
- evitar acceso informal a internals
- preparar consumo controlado desde otros módulos

**Salida esperada:**

- contrato público base documentado o implementado

### Tarea 08.03 - Definir consulta base de reporting y salida inicial

**Objetivo:**

- fijar la pieza mínima del dominio de reporting sobre la que crecerá el módulo
- dejar claros sus filtros mínimos y su salida estructurada inicial

**Salida esperada:**

- modelo base del dominio de reporting definido por contrato

### Tarea 08.04 - Validar restricciones base de acceso y tenancy

**Objetivo:**

- asegurar que el contrato inicial no ignora aislamiento multi-tenant
- proteger escenarios permitidos y denegados del dominio de reporting

**Salida esperada:**

- reglas base de acceso asociadas al módulo

### Tarea 08.05 - Definir tests del contrato base del módulo

**Objetivo:**

- asegurar cobertura mínima sobre comportamiento, permisos y límites del módulo

**Salida esperada:**

- cobertura mínima de validación para contrato, tenancy y acceso

### Tarea 08.06 - Revisar el módulo contra arquitectura y definition of done

**Objetivo:**

- asegurar que `reporting` queda bien ubicado
- asegurar que no invade otros módulos
- asegurar que el sprint cierra de forma verificable

**Salida esperada:**

- validación estructurada del sprint

---

## Riesgos del sprint

### Riesgo 1. Intentar resolver toda la complejidad del dominio de reporting

- **Mitigación:** limitar el sprint al contrato base y a la consulta mínima del módulo

### Riesgo 2. Mezclar reporting con commercial, inventory, production o automation

- **Mitigación:** mantener ownership estricto y no introducir lógica de otros dominios dentro del módulo

### Riesgo 3. Acabar con un módulo ambiguo o demasiado abstracto

- **Mitigación:** exigir contratos concretos, entradas claras y salidas claras

### Riesgo 4. Ignorar multi-tenant al definir reporting

- **Mitigación:** tratar tenant y permisos como parte obligatoria del contrato base

### Riesgo 5. Poner lógica de reporting en páginas, layouts o componentes

- **Mitigación:** concentrar la lógica del módulo en `src/features/reporting/` y exponer frontera pública

---

## Validación del sprint

Antes de cerrar Sprint 08, debe poder responderse:

- ¿está claro qué pertenece a `reporting`?
- ¿el resto del sistema puede consumir `reporting` sin invadir internals?
- ¿la consulta base de reporting y su salida inicial tienen contrato claro?
- ¿permisos y tenancy fueron considerados explícitamente?
- ¿el sprint evitó mezclar tareas de otros módulos?
- ¿hay tests proporcionales al riesgo?
- ¿la base creada permite avanzar al siguiente sprint sin caos?

Si alguna respuesta crítica es no, Sprint 08 no está cerrado.

---

## Definition of Done del sprint

Sprint 08 está done solo cuando:

- el módulo `reporting` tiene frontera clara
- el contrato base del módulo existe y es comprensible
- la consulta base de reporting está tratada como concern oficial del módulo
- permisos y multi-tenant fueron contemplados cuando aplicaban
- el trabajo respeta arquitectura, workflow y standards
- no se mezcló rediseño global ni trabajo lateral
- el sprint deja una salida concreta, verificable y reutilizable

---

## Preparación para sprints posteriores

Una vez cerrado Sprint 08, el proyecto debería quedar listo para que módulos posteriores puedan consumir `reporting` con un contrato estable, en lugar de resolver analítica o reportes de forma dispersa.

Los siguientes sprints deberán construirse sobre esta base, no rodearla.

---

## Estado de este documento

Este archivo define el Sprint 08 oficial del módulo `reporting` en ChefOS v3.

Su función es continuar la fase funcional del proyecto con un alcance pequeño, controlado y compatible con la arquitectura oficial.

---

## Detalle específico del dominio (heredado de v2)

Absorbe `docs/MODULO_DASHBOARD.md` de v2 + KPIs y alertas de `00019_m7_alerts_kpis` + get_dashboard_data de `00011_m7_dashboard`.

### Funcionalidades principales

`reporting` en v3 consolida dashboard + analytics + alerts (en v2 eran 3 módulos separados). Objetivo: **vista de control** solo-lectura que consume de todos los módulos operativos.

- **Principios**: solo lectura, prioridad operativa, cero ruido, rol-dependiente.
- **Dashboard**: banda de mando (turno · servicio · siguiente acción) + KPIs operativos + feed de alertas + tabla/kanban prioridad.
- **Alertas**: stock bajo, caducidad próxima, variance de coste, pedido sin recibir, proveedor con incidencia.
- **KPI snapshots diarios**: job programado que guarda histórico.
- **Food cost**: por evento, por servicio, agregado.
- **Cost variance report**: estimado vs real (desde `calculate_real_cost` de inventory).
- **No gráficos complejos en MVP**: cards grandes + tablas + feed.

### Modelo de datos

- `Alert` — hotel_id, tipo, severidad (urgent|warning|info), titulo, descripcion, source_module, source_id, action_url, is_dismissed, dismissed_by, dismissed_at.
- `KPISnapshot` — hotel_id, fecha, metric_key, value, metadata (jsonb).
- `DashboardData` — (vista) agregación live vía `get_dashboard_data`.

### Contratos públicos (`src/features/reporting/index.ts`)

Types: `Alert`, `AlertSeverity`, `AlertType`, `KPISnapshot`, `DashboardData`, `ALERT_TYPES`, `SEVERITY_VARIANT`, `ALERT_STATUS_LABELS`.

Hooks:
- `useDashboardData()` — RPC live con KPIs agregados
- `useActiveAlerts(filters?)`
- `useDismissAlert()`
- `useKPISnapshots(period, metricKey?)` — histórico
- `useFoodCostByEvent(eventoId)`, `useFoodCostByService(serviceId)`
- `useCostVarianceReport(period)`
- `useOperationalFeed()` — feed del dashboard (alerts + stock + pedidos + producción)

### Casos de uso (`application/`)

- `use-dashboard.ts`, `use-dashboard-data.ts`
- `use-alerts.ts`, `use-dismiss-alert.ts`
- `use-kpi-snapshots.ts`
- `use-food-cost.ts`
- `use-cost-variance.ts`
- `use-operational-feed.ts`

### RPCs consumidas

- `get_dashboard_data(p_hotel_id)` — agrega eventos, producción, compras, inventario, mermas (00011)
- `generate_daily_snapshot()` — job diario vía automation-worker
- `get_active_alerts(p_hotel_id)`
- `dismiss_alert(p_alert_id)`
- `get_food_cost_by_event(p_evento_id)`, `get_food_cost_by_service(p_service_id)`
- `get_cost_variance_report(p_from, p_to)`

### Eventos de dominio

Emite: `kpi.snapshot_created`, `alert.raised`, `alert.dismissed`.

Consume (alimenta dashboard + genera alerts):
- `inventario.lote_expiring` → alert warning
- `pedido.received_partial` → alert info si impacta evento
- `tarea_produccion.updated` (blocked) → alert warning
- `proveedor.incidencia_created` → alert warning
- `evento.updated` → re-cálculo de food_cost_estimate

### Tests mínimos

Unit: agregación de `get_dashboard_data` con mocks por módulo, dismiss_alert respeta permissions (solo admin+ según matrix).

Integration: snapshot diario incluye todos los KPIs esperados, cost variance report calcula delta correctamente.

E2E: generar evento → confirmar → observer dashboard refleja nuevo evento + food_cost estimado.

### Criterio de done específico

- [ ] Dashboard carga <1s con 10 eventos + 50 productos + 20 alerts.
- [ ] Alertas ordenadas por severidad + impacto evento.
- [ ] Click en alerta navega a módulo origen (action_url).
- [ ] Food cost por evento = sum(receta costs escaladas) + ajustes.
- [ ] Cost variance = real vs estimado con diff >5% destacado.
- [ ] KPI snapshots se guardan a diario (verificar con cron).
- [ ] Rol-dependiente: head_chef no ve cost_variance_report (ver `permissions-matrix.md`).

### Referencias cruzadas

- Consume de TODOS los módulos operativos (02-13)
- `sprints/sprint-10-automation.md` — worker genera snapshot diario
- `sprints/sprint-11-notifications.md` — alertas dispatched via notifications
- `skills/reporting/`
