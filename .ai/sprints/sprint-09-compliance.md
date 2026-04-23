# ChefOS v3 Sprint 09 - Compliance

## Objetivo del sprint

Construir la base funcional inicial del módulo `compliance` dentro de la arquitectura oficial de ChefOS v3, con alcance cerrado y orientado a estabilizar el contrato base del dominio de cumplimiento del sistema.

Este sprint no existe para resolver todo el control normativo u operativo del producto.

Existe para definir y estabilizar la primera base operativa del módulo `compliance`.

---

## Estado del sprint

- Módulo principal: `compliance`
- Tipo de sprint: funcional
- Alcance: pequeño y cerrado
- Dependencias directas:
  - `sprint-00-foundation`
  - `sprint-01-identity`
- Multi-tenant, permisos y límites de módulo: obligatorios

---

## Propósito del módulo `compliance`

El módulo `compliance` es responsable del dominio de cumplimiento dentro del sistema.

Debe actuar como owner de los contratos relacionados con:

- control base de cumplimiento
- validación obligatoria mínima del dominio
- estado base de cumplimiento
- trazabilidad mínima cuando aplique al contrato base
- restricciones funcionales mínimas por incumplimiento
- contratos públicos que otros módulos puedan consumir sin invadir internals

No debe convertirse en owner de lógica de identidad, reporting, automatización o integraciones.

---

## Objetivo funcional exacto del sprint

Dejar definido e implementable el contrato base de `compliance` para que el sistema pueda manejar, de forma explícita y controlada:

- la entidad o control base del dominio de compliance
- su estado funcional inicial
- sus validaciones obligatorias mínimas
- el acceso controlado a esa información desde otros módulos
- la frontera pública del módulo sin acceso caótico desde UI o páginas

---

## Resultado esperado

Al cerrar este sprint, el proyecto debe tener una primera base clara para `compliance` que permita:

- encapsular la lógica mínima del dominio de cumplimiento
- exponer contratos públicos base del módulo
- evitar acceso caótico a controles de compliance desde páginas o componentes
- preparar el terreno para procesos posteriores que dependan de compliance
- permitir que futuros módulos consuman `compliance` mediante contrato público claro

---

## Alcance del sprint

### Incluye

- definición del ownership del módulo `compliance`
- definición de frontera pública del módulo
- definición de contratos base del dominio de compliance
- definición de inputs y outputs mínimos del módulo
- diseño cerrado del control base de compliance y su estado inicial
- validación de restricciones base de acceso cuando aplique
- tests necesarios para el contrato base del módulo

### No incluye

- framework completo de cumplimiento para todo el sistema
- reporting transversal de cumplimiento
- automatizaciones de auditoría o bloqueo
- integraciones externas regulatorias
- rediseño global de controles entre módulos
- trazabilidad avanzada multi-módulo
- migración masiva de legacy de compliance
- cambios funcionales en módulos no relacionados

---

## Módulo afectado

- `compliance`

### Módulos no objetivo en este sprint

No deben tocarse funcionalmente salvo dependencia mínima y explícita:

- commercial
- recipes
- catalog
- procurement
- inventory
- production
- reporting
- automation
- notifications
- integrations
- hr
- agents

### Dependencia permitida

- `identity`, solo para contexto de usuario, tenant y permisos base si aplica

---

## Problemas que este sprint sí debe resolver

1. Definir qué pertenece realmente a `compliance`.
2. Evitar acceso improvisado a controles o estados de cumplimiento desde cualquier parte del sistema.
3. Fijar el contrato base que otros módulos podrán consumir.
4. Obligar a que datos, permisos y tenant del dominio de compliance se traten de forma explícita.
5. Sentar una base revisable y testeable para crecimiento posterior.

---

## Problemas que este sprint no debe intentar resolver

1. Todo el esquema de cumplimiento del sistema.
2. Toda la relación entre compliance e identity.
3. Toda la relación entre compliance y reporting.
4. Toda la automatización asociada a controles, alertas o bloqueos.
5. Integraciones externas del dominio de compliance.
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

Los entregables esperados de Sprint 09 son los mínimos necesarios para dejar una base estable del módulo `compliance`.

### 1. Definición operativa del módulo

Debe quedar claro:

- propósito
- frontera funcional
- ownership
- fuera de alcance
- dependencias autorizadas

### 2. Contratos públicos base del módulo

Debe quedar claro cómo exponer, como mínimo:

- control base de compliance
- estado base de cumplimiento
- validación obligatoria mínima
- consulta de control por contrato público
- mutación base cuando aplique
- restricciones mínimas de acceso asociadas

### 3. Estructura inicial del módulo

El módulo debe encajar en:

```txt
src/features/compliance/
```

Con estructura proporcional a su necesidad real y alineada con module-template.md.

### 4. Base de validación

Deben quedar definidos y/o implementados los tests necesarios para proteger:

- contrato del módulo
- validaciones mínimas de compliance
- restricciones base de acceso
- escenarios permitidos y denegados cuando apliquen

---

## Criterios de cierre del sprint

Sprint 09 solo se considera cerrado cuando:

- `compliance` tiene responsabilidad funcional clara.
- Existe frontera pública clara del módulo.
- El control base de compliance no depende de acceso caótico desde UI o páginas.
- El contrato base del módulo está definido con claridad.
- Permisos y tenancy fueron tratados explícitamente.
- El sprint no mezcló trabajo de otros módulos.
- Hay validación suficiente según riesgo.
- El resultado deja base real para procesos posteriores que dependan de compliance.

---

## Tareas del sprint

### Tarea 09.01 - Definir responsabilidad exacta del módulo compliance

**Objetivo:**

- fijar qué pertenece al módulo
- fijar qué queda fuera
- fijar ownership funcional

**Salida esperada:**

- definición cerrada del alcance del módulo

### Tarea 09.02 - Definir contrato público base de compliance

**Objetivo:**

- establecer qué debe exponer públicamente el módulo
- evitar acceso informal a internals
- preparar consumo controlado desde otros módulos

**Salida esperada:**

- contrato público base documentado o implementado

### Tarea 09.03 - Definir control base de compliance y estado inicial

**Objetivo:**

- fijar la pieza mínima del dominio de compliance sobre la que crecerá el módulo
- dejar claros sus datos mínimos y su estado funcional inicial

**Salida esperada:**

- modelo base del dominio de compliance definido por contrato

### Tarea 09.04 - Validar restricciones base de acceso y tenancy

**Objetivo:**

- asegurar que el contrato inicial no ignora aislamiento multi-tenant
- proteger escenarios permitidos y denegados del dominio de compliance

**Salida esperada:**

- reglas base de acceso asociadas al módulo

### Tarea 09.05 - Definir tests del contrato base del módulo

**Objetivo:**

- asegurar cobertura mínima sobre comportamiento, permisos y límites del módulo

**Salida esperada:**

- cobertura mínima de validación para contrato, tenancy y acceso

### Tarea 09.06 - Revisar el módulo contra arquitectura y definition of done

**Objetivo:**

- asegurar que `compliance` queda bien ubicado
- asegurar que no invade otros módulos
- asegurar que el sprint cierra de forma verificable

**Salida esperada:**

- validación estructurada del sprint

---

## Riesgos del sprint

### Riesgo 1. Intentar resolver toda la complejidad del dominio de compliance

- **Mitigación:** limitar el sprint al contrato base y al control mínimo del módulo

### Riesgo 2. Mezclar compliance con identity, reporting, automation o integrations

- **Mitigación:** mantener ownership estricto y no introducir lógica de otros dominios dentro del módulo

### Riesgo 3. Acabar con un módulo ambiguo o demasiado abstracto

- **Mitigación:** exigir contratos concretos, entradas claras y salidas claras

### Riesgo 4. Ignorar multi-tenant al definir compliance

- **Mitigación:** tratar tenant y permisos como parte obligatoria del contrato base

### Riesgo 5. Poner lógica de compliance en páginas, layouts o componentes

- **Mitigación:** concentrar la lógica del módulo en `src/features/compliance/` y exponer frontera pública

---

## Validación del sprint

Antes de cerrar Sprint 09, debe poder responderse:

- ¿está claro qué pertenece a `compliance`?
- ¿el resto del sistema puede consumir `compliance` sin invadir internals?
- ¿el control base de compliance y su estado inicial tienen contrato claro?
- ¿permisos y tenancy fueron considerados explícitamente?
- ¿el sprint evitó mezclar tareas de otros módulos?
- ¿hay tests proporcionales al riesgo?
- ¿la base creada permite avanzar al siguiente sprint sin caos?

Si alguna respuesta crítica es no, Sprint 09 no está cerrado.

---

## Definition of Done del sprint

Sprint 09 está done solo cuando:

- el módulo `compliance` tiene frontera clara
- el contrato base del módulo existe y es comprensible
- el control base de compliance está tratado como concern oficial del módulo
- permisos y multi-tenant fueron contemplados cuando aplicaban
- el trabajo respeta arquitectura, workflow y standards
- no se mezcló rediseño global ni trabajo lateral
- el sprint deja una salida concreta, verificable y reutilizable

---

## Preparación para sprints posteriores

Una vez cerrado Sprint 09, el proyecto debería quedar listo para que módulos posteriores puedan consumir `compliance` con un contrato estable, en lugar de resolver controles o restricciones de cumplimiento de forma dispersa.

Los siguientes sprints deberán construirse sobre esta base, no rodearla.

---

## Estado de este documento

Este archivo define el Sprint 09 oficial del módulo `compliance` en ChefOS v3.

Su función es continuar la fase funcional del proyecto con un alcance pequeño, controlado y compatible con la arquitectura oficial.

---

## Detalle específico del dominio (heredado de v2)

Absorbe `docs/MODULO_ETIQUETADO_TRAZABILIDAD.md` de v2 + APPCC + temperatures. Migración `00023_m9_compliance` + fix `00031_fix_m9_rpcs`.

### Funcionalidades principales

`compliance` en v3 consolida APPCC + temperaturas + etiquetado + trazabilidad.

- **APPCC (Análisis de Peligros y Puntos de Control Crítico)**: registros con firma digital + timestamp inmutable.
- **Plantillas APPCC**: 20 default (temperatura cámara, recepción, limpieza, desinfección, mise en place, etc.) + custom.
- **Registros APPCC**: check-in periódico (turno, diario, semanal), firma, observaciones.
- **Temperature logs**: lecturas de temperatura por equipo + alerta si fuera de rango.
- **Etiquetado**: preparaciones, productos abiertos, sobras, congelados/descongelados/pasteurizados/regenerados.
- **Código de barras/QR** único por etiqueta.
- **Trazabilidad**: `trace_lot(lot_id)` → lineage completo (qué entró, qué salió, dónde se usó).
- **Fuera de alcance en MVP**: integración física con impresoras (driver/conector a futuro). Genera PDF como fallback.

### Modelo de datos

APPCC:

- `APPCCTemplate` — hotel_id, nombre, tipo, categoria, frecuencia (turno|diario|semanal|mensual), campos (jsonb), activa.
- `APPCCRecord` — template_id, usuario_id, fecha, valores (jsonb), observaciones, firma (path o hash), estado (draft|submitted|reviewed).

Temperaturas:

- `Equipment` — hotel_id, nombre, tipo (camara|congelador|horno), rango_min, rango_max.
- `TemperatureLog` — equipment_id, usuario_id, fecha, temperatura, is_within_range, observaciones.

Etiquetado + trazabilidad:

- `LabelTemplate` — hotel_id, nombre, tipo (preparacion|producto|sobras|congelado|pasteurizado), campos_visibles, activa.
- `Label` — hotel_id, codigo_barra (único), tipo, template_id, producto_id, receta_id, nombre_libre, cantidad, unidad, fechas (elaboracion|apertura|congelacion|descongelacion|caducidad), tratamiento, ubicacion_id, origen, evento_id, tarea_id, pedido_id, usuario_id.
- `LabelInventoryLink` — label_id, lot_id (vincula label con lote sin duplicar stock).
- `ExpiryRule` — hotel_id, tipo_etiqueta, vida_util_horas, requiere_caducidad.

### Contratos públicos (`src/features/compliance/index.ts`)

Types: `APPCCTemplate`, `APPCCRecord`, `Equipment`, `TemperatureLog`, `LabelTemplate`, `Label`, `LabelInventoryLink`, `ExpiryRule`, `APPCC_STATUS_VARIANT`, `LABEL_TYPES`, `TREATMENT_TYPES`.

Hooks:

- `useAPPCCTemplates()`, `useCreateAPPCCRecord()`, `useAPPCCRecords(filters?)`
- `useTemperatureLogs(equipmentId?)`, `useLogTemperature()`
- `useLabelTemplates()`, `useCreateLabel()`, `useLabels(filters?)`
- `useTraceLot(lotId)` — lineage completo
- `useExpiryRules()`, `useUpdateExpiryRule()`

### Casos de uso (`application/`)

- `use-appcc-templates.ts`, `use-create-appcc-record.ts`, `use-appcc-records.ts`
- `use-temperature-logs.ts`, `use-log-temperature.ts`
- `use-labels.ts`, `use-create-label.ts`, `use-label-templates.ts`
- `use-trace-lot.ts`
- `use-expiry-rules.ts`

### RPCs consumidas

- `seed_appcc_defaults(p_hotel_id)` — 20 plantillas, 00051 scope fix
- `create_appcc_record`, `log_temperature`
- `create_label(...)` — genera codigo_barra único + vincula a lote si aplica
- `trace_lot(p_lot_id)` — devuelve lineage + audit trail
- `get_temperature_alerts()` — filas `is_within_range=false`

### State machines

APPCCRecord: `draft → submitted → reviewed` (+ admin puede reabrir con ADR).
Label: no state machine (append-only). Las etiquetas vencen según ExpiryRule.

### Eventos de dominio

Emite: `appcc.record_created`, `temperature.logged`, `temperature.out_of_range`, `label.created`, `lot.traced`.

Consume: `evento.completed` → sugerir etiquetado de sobras, `inventario.lote_created` → auto-crear etiqueta si viene de producción.

### Tests mínimos

Unit: cálculo de fecha_caducidad según ExpiryRule (por tipo etiqueta), validación temperature dentro de rango.

Integration: trace_lot devuelve lineage correcto (lot → GR → PO → PR → evento), firma digital es timestamp inmutable.

E2E: log temperatura fuera de rango → alerta emitida + registrada; crear label de sobras tras evento → vincula a lote inventario.

### Criterio de done específico

- [ ] 20 plantillas APPCC sembradas en nuevo hotel automáticamente.
- [ ] Firma digital en APPCCRecord timestamp inmutable (hash guardado).
- [ ] Temperature out-of-range emite `temperature.out_of_range` + alerta urgent.
- [ ] Label genera codigo_barra único (collision check).
- [ ] trace_lot en <500ms con 100 eventos de lineage.
- [ ] Fallback PDF disponible si no hay impresora configurada.
- [ ] Inspector sanidad puede consultar historial en <3s.

### Referencias cruzadas

- `sprints/sprint-06-inventory.md` — Label vincula a StockLot vía LabelInventoryLink
- `sprints/sprint-07-production.md` — etiquetar preparaciones desde tasks
- `sprints/sprint-02-commercial.md` — etiquetar sobras desde evento
- `skills/compliance/`
