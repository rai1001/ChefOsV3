# ChefOS v3 Sprint 06 - Inventory

## Objetivo del sprint

Construir la base funcional inicial del módulo `inventory` dentro de la arquitectura oficial de ChefOS v3, con alcance cerrado y orientado a estabilizar el contrato base del dominio de inventario del sistema.

Este sprint no existe para resolver toda la operativa de stock del producto.

Existe para definir y estabilizar la primera base operativa del módulo `inventory`.

---

## Estado del sprint

- Módulo principal: `inventory`
- Tipo de sprint: funcional
- Alcance: pequeño y cerrado
- Dependencias directas:
  - `sprint-00-foundation`
  - `sprint-01-identity`
- Multi-tenant, permisos y límites de módulo: obligatorios

---

## Propósito del módulo `inventory`

El módulo `inventory` es responsable del dominio de inventario dentro del sistema.

Debe actuar como owner de los contratos relacionados con:

- entidad base de stock o existencia
- estado actual de disponibilidad
- movimientos mínimos de inventario cuando apliquen al contrato base
- reglas mínimas de consistencia de stock
- estado funcional inicial del inventario
- contratos públicos que otros módulos puedan consumir sin invadir internals

No debe convertirse en owner de lógica de procurement, producción, reporting o automatización.

---

## Objetivo funcional exacto del sprint

Dejar definido e implementable el contrato base de `inventory` para que el sistema pueda manejar, de forma explícita y controlada:

- la entidad base de inventario del dominio
- su estado funcional inicial
- sus datos mínimos operativos
- el acceso controlado a esa información desde otros módulos
- la frontera pública del módulo sin acceso caótico desde UI o páginas

---

## Resultado esperado

Al cerrar este sprint, el proyecto debe tener una primera base clara para `inventory` que permita:

- encapsular la lógica mínima del dominio de inventario
- exponer contratos públicos base del módulo
- evitar acceso caótico a stock o existencias desde páginas o componentes
- preparar el terreno para procesos posteriores que dependan de inventario
- permitir que futuros módulos consuman `inventory` mediante contrato público claro

---

## Alcance del sprint

### Incluye

- definición del ownership del módulo `inventory`
- definición de frontera pública del módulo
- definición de contratos base del dominio de inventario
- definición de inputs y outputs mínimos del módulo
- diseño cerrado de la entidad base de inventario y su estado inicial
- validación de restricciones base de acceso cuando aplique
- tests necesarios para el contrato base del módulo

### No incluye

- procurement completo
- ejecución completa de producción
- reporting transversal de stock
- automatizaciones de reposición
- integraciones externas de inventario
- reconciliación avanzada de inventario
- migración masiva de legacy de inventory
- cambios funcionales en módulos no relacionados

---

## Módulo afectado

- `inventory`

### Módulos no objetivo en este sprint

No deben tocarse funcionalmente salvo dependencia mínima y explícita:

- commercial
- recipes
- catalog
- procurement
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

1. Definir qué pertenece realmente a `inventory`.
2. Evitar acceso improvisado a datos de stock desde cualquier parte del sistema.
3. Fijar el contrato base que otros módulos podrán consumir.
4. Obligar a que datos, permisos y tenant del dominio de inventario se traten de forma explícita.
5. Sentar una base revisable y testeable para crecimiento posterior.

---

## Problemas que este sprint no debe intentar resolver

1. Todo el flujo completo de inventario del sistema.
2. Toda la relación entre inventory y procurement.
3. Toda la relación entre inventory y production.
4. Toda la automatización asociada a reposición o alertas.
5. Integraciones externas del dominio de inventario.
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

Los entregables esperados de Sprint 06 son los mínimos necesarios para dejar una base estable del módulo `inventory`.

### 1. Definición operativa del módulo

Debe quedar claro:

- propósito
- frontera funcional
- ownership
- fuera de alcance
- dependencias autorizadas

### 2. Contratos públicos base del módulo

Debe quedar claro cómo exponer, como mínimo:

- entidad base de inventario
- estado base de stock o disponibilidad
- consulta de entidad de inventario por contrato público
- mutación base cuando aplique
- restricciones mínimas de acceso asociadas

### 3. Estructura inicial del módulo

El módulo debe encajar en:

```txt
src/features/inventory/
```

Con estructura proporcional a su necesidad real y alineada con module-template.md.

### 4. Base de validación

Deben quedar definidos y/o implementados los tests necesarios para proteger:

- contrato del módulo
- datos mínimos de inventario
- restricciones base de acceso
- escenarios permitidos y denegados cuando apliquen

---

## Criterios de cierre del sprint

Sprint 06 solo se considera cerrado cuando:

- `inventory` tiene responsabilidad funcional clara.
- Existe frontera pública clara del módulo.
- La entidad base de inventario no depende de acceso caótico desde UI o páginas.
- El contrato base del módulo está definido con claridad.
- Permisos y tenancy fueron tratados explícitamente.
- El sprint no mezcló trabajo de otros módulos.
- Hay validación suficiente según riesgo.
- El resultado deja base real para procesos posteriores que dependan de inventario.

---

## Tareas del sprint

### Tarea 06.01 - Definir responsabilidad exacta del módulo inventory

**Objetivo:**

- fijar qué pertenece al módulo
- fijar qué queda fuera
- fijar ownership funcional

**Salida esperada:**

- definición cerrada del alcance del módulo

### Tarea 06.02 - Definir contrato público base de inventory

**Objetivo:**

- establecer qué debe exponer públicamente el módulo
- evitar acceso informal a internals
- preparar consumo controlado desde otros módulos

**Salida esperada:**

- contrato público base documentado o implementado

### Tarea 06.03 - Definir entidad base de inventario y estado inicial

**Objetivo:**

- fijar la pieza mínima del dominio de inventario sobre la que crecerá el módulo
- dejar claros sus datos mínimos y su estado funcional inicial

**Salida esperada:**

- modelo base del dominio de inventario definido por contrato

### Tarea 06.04 - Validar restricciones base de acceso y tenancy

**Objetivo:**

- asegurar que el contrato inicial no ignora aislamiento multi-tenant
- proteger escenarios permitidos y denegados del dominio de inventario

**Salida esperada:**

- reglas base de acceso asociadas al módulo

### Tarea 06.05 - Definir tests del contrato base del módulo

**Objetivo:**

- asegurar cobertura mínima sobre comportamiento, permisos y límites del módulo

**Salida esperada:**

- cobertura mínima de validación para contrato, tenancy y acceso

### Tarea 06.06 - Revisar el módulo contra arquitectura y definition of done

**Objetivo:**

- asegurar que `inventory` queda bien ubicado
- asegurar que no invade otros módulos
- asegurar que el sprint cierra de forma verificable

**Salida esperada:**

- validación estructurada del sprint

---

## Riesgos del sprint

### Riesgo 1. Intentar resolver toda la complejidad del dominio de inventario

- **Mitigación:** limitar el sprint al contrato base y a la entidad mínima del módulo

### Riesgo 2. Mezclar inventory con procurement, production, reporting o automation

- **Mitigación:** mantener ownership estricto y no introducir lógica de otros dominios dentro del módulo

### Riesgo 3. Acabar con un módulo ambiguo o demasiado abstracto

- **Mitigación:** exigir contratos concretos, entradas claras y salidas claras

### Riesgo 4. Ignorar multi-tenant al definir inventario

- **Mitigación:** tratar tenant y permisos como parte obligatoria del contrato base

### Riesgo 5. Poner lógica de inventario en páginas, layouts o componentes

- **Mitigación:** concentrar la lógica del módulo en `src/features/inventory/` y exponer frontera pública

---

## Validación del sprint

Antes de cerrar Sprint 06, debe poder responderse:

- ¿está claro qué pertenece a `inventory`?
- ¿el resto del sistema puede consumir `inventory` sin invadir internals?
- ¿la entidad base de inventario y su estado inicial tienen contrato claro?
- ¿permisos y tenancy fueron considerados explícitamente?
- ¿el sprint evitó mezclar tareas de otros módulos?
- ¿hay tests proporcionales al riesgo?
- ¿la base creada permite avanzar al siguiente sprint sin caos?

Si alguna respuesta crítica es no, Sprint 06 no está cerrado.

---

## Definition of Done del sprint

Sprint 06 está done solo cuando:

- el módulo `inventory` tiene frontera clara
- el contrato base del módulo existe y es comprensible
- la entidad base de inventario está tratada como concern oficial del módulo
- permisos y multi-tenant fueron contemplados cuando aplicaban
- el trabajo respeta arquitectura, workflow y standards
- no se mezcló rediseño global ni trabajo lateral
- el sprint deja una salida concreta, verificable y reutilizable

---

## Preparación para sprints posteriores

Una vez cerrado Sprint 06, el proyecto debería quedar listo para que módulos posteriores puedan consumir `inventory` con un contrato estable, en lugar de resolver stock o existencias de forma dispersa.

Los siguientes sprints deberán construirse sobre esta base, no rodearla.

---

## Estado de este documento

Este archivo define el Sprint 06 oficial del módulo `inventory` en ChefOS v3.

Su función es continuar la fase funcional del proyecto con un alcance pequeño, controlado y compatible con la arquitectura oficial.

---

## Detalle específico del dominio (heredado de v2)

Absorbe `docs/MODULO_INVENTARIO.md` + `docs/MODULO_MERMAS_MEJORA_CONTINUA.md` de v2. Migraciones: `00009_m5_inventory` + `00012_fix_inventory_rpcs` + `00016_m5_reservations_counts` + fix `00038`.

### Funcionalidades principales

**Inventario**

- **Lotes y caducidades**: cada entrada crea un lote (producto, cantidad, unidad, fecha_entrada, fecha_caducidad obligatoria cuando aplique, ubicación opcional).
- **FIFO automático**: salidas descuentan del lote más antiguo.
- **Entradas**: recepción desde PO (foto albarán) o entrada manual.
- **Salidas**: "Sacar del almacén" desde móvil (producción, consumo directo, evento, merma).
- **Ajustes**: inventario físico, corrección error, rotura.
- **Stock reservations**: reservar stock para evento (FIFO por evento).
- **Stock counts**: conteo ciego (blind count) con revisión admin.
- **Forensics**: qué lote se consumió, cuándo, en qué servicio.
- **Calculate real cost**: coste real post-consumo vs estimado.

**Mermas (mejora continua)**

- Registrar merma desde móvil en ≤10 segundos.
- Motivos: caducidad, sobreproduccion, error_preparacion, mala_conservacion, rotura_accidente, devolucion, sobras_evento, otros.
- Análisis: top 10 productos con merma, por motivo, por evento, por semana.
- Alertas: merma elevada → AVISO; repetición motivo → AVISO; merma previa a evento → CRÍTICO.

### Modelo de datos

- `StockLot` — hotel_id, product_id, cantidad, unidad_stock, fecha_entrada, fecha_caducidad, proveedor_id, po_id, gr_id, ubicacion_id, estado.
- `StockMovement` — hotel_id, product_id, lot_id, tipo (entrada|salida|merma|ajuste), cantidad, motivo, origen, referencia_id, usuario_id.
- `StockReservation` — hotel_id, evento_id, lot_id, cantidad_reservada, estado (pending|consumed|released).
- `ExpiryRule` — product_id, hours_warning (default 48h).
- `StockCount` — hotel_id, fecha, estado (open|submitted|reviewed), reviewed_by.
- `StockCountLine` — count_id, product_id, cantidad_contada, cantidad_teorica, delta.
- `Waste` — product_id, cantidad, motivo, evento_id, tarea_id, usuario_id, foto_path, comentario.
- `Location` — hotel_id, nombre (cámara, congelador, almacén, …).

### Contratos públicos (`src/features/inventory/index.ts`)

Types: `StockLot`, `StockMovement`, `StockReservation`, `StockCount`, `StockCountLine`, `Waste`, `Location`, `WASTE_REASONS`, `MOVEMENT_TYPES`, `COUNT_STATUSES`, `ALERT_VARIANT`, `COUNT_STATUS_VARIANT`.

Hooks:

- `useStockLevels(filters?)`, `useStockLots(productId)`
- `useStockMovements(filters?)`
- `useReserveStockForEvent()`, `useConsumeReservation()`, `useReleaseReservation()`
- `useStockCounts()`, `useStartCount()`, `useSubmitCount()`, `useReviewCount()`
- `useRecordWaste()`, `useWasteAnalysis(period)`
- `useStockForensics(lotId)`
- `useExpiryAlerts()`

### Casos de uso (`application/`)

- `use-inventory.ts`, `use-stock-lots.ts`, `use-stock-movements.ts`
- `use-reserve-stock.ts`, `use-consume-reservation.ts`, `use-release-reservation.ts`
- `use-stock-counts.ts`, `use-start-count.ts`, `use-submit-count.ts`
- `use-record-waste.ts`, `use-waste-analysis.ts`
- `use-stock-forensics.ts`
- `use-calculate-real-cost.ts`

### RPCs consumidas

- `get_stock_levels` (LEFT JOIN fix 00012)
- `create_stock_lot` (trigger auto desde receive_goods si quality_status=accepted, 00041 skip si OCR pending)
- `record_waste` (ownership fix 00012)
- `transfer_stock` (split-lot para transferencias parciales, fix 00012)
- `reserve_stock_for_event(p_evento_id, p_producto_id, p_cantidad)` — FIFO por evento
- `consume_reservation`, `release_reservation`
- `calculate_real_cost(p_evento_id)`
- `start_stock_count`, `submit_stock_count`, `review_stock_count`
- `get_stock_forensics(p_lot_id)`

### Eventos de dominio

Emite: `inventario.lote_created`, `inventario.lote_expiring` (alerta anticipada), `inventario.lote_expired`, `inventario.merma_recorded`, `inventario.count_submitted`, `inventario.count_reviewed`.

Consume: `pedido.received_complete|partial` (crear lotes vía trigger), `evento.confirmed` (reservar stock), `evento.cancelled` (liberar reservations).

### Tests mínimos

Unit: FIFO con 3 lotes + split partial, cálculo de cantidad_faltante, validación motivo de merma en whitelist.

Integration: reserve_stock_for_event con stock insuficiente → error, stock count review actualiza stock real.

E2E: recibir albarán con caducidad → lote con alerta a 48h → consumir en evento → forensics muestra trazabilidad.

### Criterio de done específico

- [ ] FIFO descuenta automáticamente, lotes más antiguos primero.
- [ ] Registrar merma desde móvil <10s (medir con Playwright).
- [ ] Alertas caducidad en dashboard + feed.
- [ ] Stock count ciego (el usuario no ve cantidad teórica hasta submit).
- [ ] Forensics muestra lineage completo (lote → GR → PO → PR → evento).
- [ ] Calculate real cost consistente con escandallo (sprint-03).

### Referencias cruzadas

- `sprints/sprint-05-procurement.md` — receive_goods crea lotes
- `sprints/sprint-02-commercial.md` — reserve_stock_for_event consumido al confirmar evento
- `sprints/sprint-07-production.md` — salidas de stock durante elaboración
- `sprints/sprint-08-reporting.md` — forensics feed KPIs food cost real
- `skills/inventory/`
