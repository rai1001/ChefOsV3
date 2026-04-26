# ChefOS v3 Sprint 05 - Procurement

## Objetivo del sprint

Construir la base funcional inicial del módulo `procurement` dentro de la arquitectura oficial de ChefOS v3, con alcance cerrado y orientado a estabilizar el contrato base del dominio de compras y abastecimiento del sistema.

Este sprint no existe para resolver todo el proceso operativo de compras del producto.

Existe para definir y estabilizar la primera base operativa del módulo `procurement`.

---

## Estado del sprint

- Módulo principal: `procurement`
- Tipo de sprint: funcional
- Alcance: pequeño y cerrado
- Dependencias directas:
  - `sprint-00-foundation`
  - `sprint-01-identity`
- Multi-tenant, permisos y límites de módulo: obligatorios

### Ejecución acordada 2026-04-26

Para mantener PRs revisables, `sprint-05-procurement` se ejecuta partido:

- **05a - PR/PO base**: Purchase Requests, Purchase Orders, consolidación por proveedor, state machines, RLS, RPCs v3 y UI mínima. Sin Goods Receipts ni OCR.
- **05b - Goods Receipts + inventario**: recepción completa/parcial, lotes/impacto inventory, cierre de deuda `v3_get_escandallo_live` contra tablas v2.
- **05c - OCR albaranes**: carga de foto, deduplicación, review queue y matching asistido.

Decisiones de alcance:

- La autogeneración de PR desde `event.confirmed` entra en 05a como trigger idempotente sobre `v3_domain_events`.
- No se migra data v2 de procurement en 05a: se parte de cero sobre tablas `v3_*`.
- La implementación DB toma como referencia el modelo operativo validado en WALL-E; la capa TS/UX queda en ChefOS v3.

---

## Propósito del módulo `procurement`

El módulo `procurement` es responsable del dominio de compras y abastecimiento dentro del sistema.

Debe actuar como owner de los contratos relacionados con:

- solicitud base de compra o abastecimiento
- proveedor base cuando aplique al contrato mínimo
- estado base del proceso de compra
- datos mínimos de abastecimiento
- reglas mínimas de validación del dominio
- contratos públicos que otros módulos puedan consumir sin invadir internals

No debe convertirse en owner de lógica de inventario, producción, reporting o integraciones.

---

## Objetivo funcional exacto del sprint

Dejar definido e implementable el contrato base de `procurement` para que el sistema pueda manejar, de forma explícita y controlada:

- la entidad base de compra o abastecimiento del dominio
- su estado funcional inicial
- sus datos mínimos operativos
- el acceso controlado a esa información desde otros módulos
- la frontera pública del módulo sin acceso caótico desde UI o páginas

---

## Resultado esperado

Al cerrar este sprint, el proyecto debe tener una primera base clara para `procurement` que permita:

- encapsular la lógica mínima del dominio de compras
- exponer contratos públicos base del módulo
- evitar acceso caótico a procurement desde páginas o componentes
- preparar el terreno para procesos posteriores de abastecimiento
- permitir que futuros módulos consuman `procurement` mediante contrato público claro

---

## Alcance del sprint

### Incluye

- definición del ownership del módulo `procurement`
- definición de frontera pública del módulo
- definición de contratos base del dominio de compras y abastecimiento
- definición de inputs y outputs mínimos del módulo
- diseño cerrado de la entidad base de procurement y su estado inicial
- validación de restricciones base de acceso cuando aplique
- tests necesarios para el contrato base del módulo

### No incluye

- control completo de stock
- movimientos de inventario
- ejecución de producción
- integraciones externas de proveedores
- automatizaciones de compra
- reporting transversal de compras
- migración masiva de legacy de procurement
- cambios funcionales en módulos no relacionados

---

## Módulo afectado

- `procurement`

### Módulos no objetivo en este sprint

No deben tocarse funcionalmente salvo dependencia mínima y explícita:

- commercial
- recipes
- catalog
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

1. Definir qué pertenece realmente a `procurement`.
2. Evitar acceso improvisado a datos de compras desde cualquier parte del sistema.
3. Fijar el contrato base que otros módulos podrán consumir.
4. Obligar a que datos, permisos y tenant del dominio de procurement se traten de forma explícita.
5. Sentar una base revisable y testeable para crecimiento posterior.

---

## Problemas que este sprint no debe intentar resolver

1. Todo el flujo completo de compras del sistema.
2. Toda la relación entre procurement e inventory.
3. Toda la relación entre procurement y production.
4. Toda la automatización del abastecimiento.
5. Integraciones externas del dominio de compras.
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

Los entregables esperados de Sprint 05 son los mínimos necesarios para dejar una base estable del módulo `procurement`.

### 1. Definición operativa del módulo

Debe quedar claro:

- propósito
- frontera funcional
- ownership
- fuera de alcance
- dependencias autorizadas

### 2. Contratos públicos base del módulo

Debe quedar claro cómo exponer, como mínimo:

- entidad base de compra o abastecimiento
- estado base del proceso de procurement
- consulta de entidad de procurement por contrato público
- mutación base cuando aplique
- restricciones mínimas de acceso asociadas

### 3. Estructura inicial del módulo

El módulo debe encajar en:

```txt
src/features/procurement/
```

Con estructura proporcional a su necesidad real y alineada con module-template.md.

### 4. Base de validación

Deben quedar definidos y/o implementados los tests necesarios para proteger:

- contrato del módulo
- datos mínimos de procurement
- restricciones base de acceso
- escenarios permitidos y denegados cuando apliquen

---

## Criterios de cierre del sprint

Sprint 05 solo se considera cerrado cuando:

- `procurement` tiene responsabilidad funcional clara.
- Existe frontera pública clara del módulo.
- La entidad base de procurement no depende de acceso caótico desde UI o páginas.
- El contrato base del módulo está definido con claridad.
- Permisos y tenancy fueron tratados explícitamente.
- El sprint no mezcló trabajo de otros módulos.
- Hay validación suficiente según riesgo.
- El resultado deja base real para procesos posteriores de abastecimiento.

---

## Tareas del sprint

### Tarea 05.01 - Definir responsabilidad exacta del módulo procurement

**Objetivo:**

- fijar qué pertenece al módulo
- fijar qué queda fuera
- fijar ownership funcional

**Salida esperada:**

- definición cerrada del alcance del módulo

### Tarea 05.02 - Definir contrato público base de procurement

**Objetivo:**

- establecer qué debe exponer públicamente el módulo
- evitar acceso informal a internals
- preparar consumo controlado desde otros módulos

**Salida esperada:**

- contrato público base documentado o implementado

### Tarea 05.03 - Definir entidad base de procurement y estado inicial

**Objetivo:**

- fijar la pieza mínima del dominio de compras sobre la que crecerá el módulo
- dejar claros sus datos mínimos y su estado funcional inicial

**Salida esperada:**

- modelo base del dominio de procurement definido por contrato

### Tarea 05.04 - Validar restricciones base de acceso y tenancy

**Objetivo:**

- asegurar que el contrato inicial no ignora aislamiento multi-tenant
- proteger escenarios permitidos y denegados del dominio de procurement

**Salida esperada:**

- reglas base de acceso asociadas al módulo

### Tarea 05.05 - Definir tests del contrato base del módulo

**Objetivo:**

- asegurar cobertura mínima sobre comportamiento, permisos y límites del módulo

**Salida esperada:**

- cobertura mínima de validación para contrato, tenancy y acceso

### Tarea 05.06 - Revisar el módulo contra arquitectura y definition of done

**Objetivo:**

- asegurar que `procurement` queda bien ubicado
- asegurar que no invade otros módulos
- asegurar que el sprint cierra de forma verificable

**Salida esperada:**

- validación estructurada del sprint

---

## Riesgos del sprint

### Riesgo 1. Intentar resolver toda la complejidad del dominio de compras

- **Mitigación:** limitar el sprint al contrato base y a la entidad mínima del módulo

### Riesgo 2. Mezclar procurement con inventory, production, integrations o automation

- **Mitigación:** mantener ownership estricto y no introducir lógica de otros dominios dentro del módulo

### Riesgo 3. Acabar con un módulo ambiguo o demasiado abstracto

- **Mitigación:** exigir contratos concretos, entradas claras y salidas claras

### Riesgo 4. Ignorar multi-tenant al definir procurement

- **Mitigación:** tratar tenant y permisos como parte obligatoria del contrato base

### Riesgo 5. Poner lógica de procurement en páginas, layouts o componentes

- **Mitigación:** concentrar la lógica del módulo en `src/features/procurement/` y exponer frontera pública

---

## Validación del sprint

Antes de cerrar Sprint 05, debe poder responderse:

- ¿está claro qué pertenece a `procurement`?
- ¿el resto del sistema puede consumir `procurement` sin invadir internals?
- ¿la entidad base de procurement y su estado inicial tienen contrato claro?
- ¿permisos y tenancy fueron considerados explícitamente?
- ¿el sprint evitó mezclar tareas de otros módulos?
- ¿hay tests proporcionales al riesgo?
- ¿la base creada permite avanzar al siguiente sprint sin caos?

Si alguna respuesta crítica es no, Sprint 05 no está cerrado.

---

## Definition of Done del sprint

Sprint 05 está done solo cuando:

- el módulo `procurement` tiene frontera clara
- el contrato base del módulo existe y es comprensible
- la entidad base de procurement está tratada como concern oficial del módulo
- permisos y multi-tenant fueron contemplados cuando aplicaban
- el trabajo respeta arquitectura, workflow y standards
- no se mezcló rediseño global ni trabajo lateral
- el sprint deja una salida concreta, verificable y reutilizable

---

## Preparación para sprints posteriores

Una vez cerrado Sprint 05, el proyecto debería quedar listo para que módulos posteriores puedan consumir `procurement` con un contrato estable, en lugar de resolver compras o abastecimiento de forma dispersa.

Los siguientes sprints deberán construirse sobre esta base, no rodearla.

---

## Estado de este documento

Este archivo define el Sprint 05 oficial del módulo `procurement` en ChefOS v3.

Su función es continuar la fase funcional del proyecto con un alcance pequeño, controlado y compatible con la arquitectura oficial.

---

## Detalle específico del dominio (heredado de v2)

Absorbe `docs/MODULO_COMPRAS_PEDIDOS.md` de v2 + la skill `ocr-delivery-notes-workflow`. Migraciones: `00008_m4_procurement` + `00039_ocr_infrastructure` a `00046_domain_events_dedup` + fix `00036_head_chef_procurement` + `00045_po_idempotency`.

### Funcionalidades principales

Ciclo **necesidad → pedido → envío → recepción → conciliación** agrupando por proveedor.

- **Necesidad**: no es pedido. Viene de eventos (menús→recetas→productos), producción manual o peticiones manuales.
- **Pedido**: 1 proveedor por pedido. Agrupa múltiples necesidades (eventos, departamentos).
- **Recepción**: completa, parcial, con extras, con sustituciones. Actualiza inventario.
- **OCR de albaranes**: flujo estrella (foto → Claude Vision → matching alias → GR lines → cascada precios). Ver `skills/ocr-delivery-notes-workflow/`.
- **Reglas proveedor** (desde catalog): días entrega, hora corte, lead time, pedido mínimo.
- **Generación PDF** al pasar a Enviado.

### Modelo de datos

- `PurchaseRequest` (PR) — hotel_id, origen, estado, fecha_necesidad, requested_by.
- `PurchaseRequestLine` — pr_id, product_id, cantidad, unidad, evento_id, departamento, origen.
- `PurchaseOrder` (PO) — hotel_id, supplier_id, estado, fecha_pedido, fecha_entrega_estimada, approved_by, pdf_path.
- `PurchaseOrderLine` — po_id, product_id, cantidad_pedida, cantidad_recibida, evento_id, departamento, last_unit_price.
- `GoodsReceipt` (GR) — po_id, supplier_id, fecha, delivery_note_image_hash (unique parcial), imagen_path, notas.
- `GoodsReceiptLine` — gr_id, order_line_id, cantidad_recibida, lot_number, expiry_date, unit_price, quality_status ('accepted' | 'partial' | 'rejected'), rejection_reason.
- `PriceChangeLog` — product_id, old_price, new_price, source, detected_at, delta_pct.

### State machines

PR: `draft → approved → consolidated` (+ `cancelled`).
PO: `draft → sent → received_partial → received_complete → closed` (+ `cancelled`).
GR.quality_status: `accepted | partial | rejected` (solo `accepted` crea lotes stock).

### Contratos públicos (`src/features/procurement/index.ts`)

#### 05a implementado

Types: `PurchaseRequest`, `PurchaseRequestLine`, `PurchaseOrder`, `PurchaseOrderLine`, `PriceChangeLog`, `PR_STATUSES`, `PR_ORIGINS`, `PO_STATUSES`, `PROCUREMENT_DEPARTMENTS`, `PR_STATUS_LABELS`, `PO_STATUS_LABELS`, `PR_STATUS_VARIANT`, `PO_STATUS_VARIANT`.

Hooks:
- `usePurchaseRequests(filters?)`, `usePurchaseRequest(id)`
- `usePurchaseOrders(filters?)`, `usePurchaseOrder(id)`
- `useCreatePR()`, `useTransitionPR()`, `useConsolidatePRs()`
- `useTransitionPO()`
- `useGenerateEventPRs()`

#### Diferido a 05b/05c

- `GoodsReceipt`, `GoodsReceiptLine`, `GR_QUALITY_STATUSES`
- `useGoodsReceipts(poId?)`, `useGoodsReceipt(id)`
- `useCreatePO()`, `useSendPO()`, `useReceivePO()`
- `useUploadDeliveryNote()` — cliente calcula SHA-256 + upload + enqueue OCR job
- `useOCRReviewQueue()` — lista líneas pending_review + product_unknown
- `useAcceptOCRMatch()`, `useRejectOCRMatch()`

### Casos de uso (`application/`)

- `use-purchase-requests.ts`, `use-purchase-request.ts`
- `use-purchase-orders.ts`, `use-purchase-order.ts`
- `use-goods-receipts.ts`, `use-ocr-receipt.ts`
- `use-upload-delivery-note.ts` (SHA-256 + upload + dedup check)
- `use-create-pr.ts`, `use-transition-pr.ts`, `use-consolidate-prs.ts`
- `use-create-po.ts`, `use-send-po.ts`, `use-receive-po.ts`

### RPCs consumidas

#### 05a implementado

- `v3_create_purchase_request`
- `v3_transition_purchase_request`
- `v3_generate_purchase_order(p_pr_ids[])` — consolida PRs en PO con locks por PR aprobada
- `v3_transition_purchase_order`
- `v3_generate_purchase_requests_for_event`

#### Diferido a 05b/05c

- `send_purchase_order` (genera PDF via Edge Function)
- `receive_goods(p_po_id, p_lines[])` — 00051 (scope fix)
- `process_ocr_receipt(p_receipt_id, p_ocr_data, p_image_hash)` — idempotencia 00044
- `match_product_by_alias(p_hotel_id, p_query)` — consume de catalog
- `consume_rate_limit('ocr:...')` — 30/hora/hotel + 5/min/user

### Edge Functions

- `ocr-receipt` — valida Authorization, rate limits, Claude Vision call con backoff (Retry-After / exponencial + jitter, cap 30s), dedup por hash antes de llamar a Claude.

### Eventos de dominio

Emite: `purchase_request.created|approved|consolidated`, `pedido.sent|received_partial|received_complete`, `ocr.receipt_processed|needs_review`, `product.price_changed` (cascada a recipes).

Consume: `evento.confirmed` (genera necesidades), `evento.cancelled` (libera PR/PO asociados).

### Tests mínimos

Unit: state machines PR/PO/GR, cálculo de cantidad_faltante, detección delta precio >5%.

Integration: `generate_purchase_order` con concurrencia (2 calls mismas PRs → una gana), OCR idempotente (subir misma foto 2× → early return).

E2E: PR → aprobar → consolidar en PO → enviar → recibir foto albarán → stock actualizado + escandallo recalculado si cambio precio.

### Criterio de done específico

- [ ] OCR end-to-end: foto → GR lines en <30s con ≥85% auto-match.
- [ ] Idempotencia: subir misma foto 2× no duplica.
- [ ] Rate limit 429 devuelve headers `X-RateLimit-*` + `Retry-After`.
- [ ] Recepción parcial genera alertas con impacto en eventos afectados.
- [ ] PDF de PO generado sin crash Turbopack.
- [ ] Cross-tenant rechazado (cross-hotel PR consume en PO denegado).

### Referencias cruzadas

- `sprints/sprint-04-catalog.md` — proveedor preferido + alias
- `sprints/sprint-06-inventory.md` — receive_goods crea lotes
- `sprints/sprint-03-recipes.md` — trigger cascada precios
- `skills/ocr-delivery-notes-workflow/`
- `specs/database-security.md` (rate limits, idempotencia, SECURITY DEFINER)

---

## Cierre 05b — 2026-04-26

### Entregado

- **Goods Receipts v3**: migración `00064_v3_procurement_gr.sql` añade `v3_gr_quality_status`, `v3_goods_receipts`, `v3_goods_receipt_lines`, índices por PO/proveedor/producto, FKs tenant-aware, RLS SELECT por membership y mutación solo vía RPC.
- **Recepción manual**: migración `00065_v3_procurement_gr_rpcs.sql` añade `v3_receive_goods(...)` con `SELECT ... FOR UPDATE`, control de cantidad pendiente, transición `sent|received_partial → received_partial|received_complete`, eventos `goods_receipt.created` y `purchase_order.received_*`, y `v3_price_change_log` cuando cambia `unit_price`.
- **Escandallo repuntado a v3**: migración `00066_v3_escandallo_repoint.sql` reemplaza lecturas heredadas de `public.goods_receipts`, `public.goods_receipt_items`, `public.purchase_orders`, `public.purchase_order_items` por `public.v3_goods_receipts`, `public.v3_goods_receipt_lines`, `public.v3_purchase_orders`, `public.v3_purchase_order_lines`.
- **FK deuda ADR-0015 cerrada**: migración `00067_v3_supplier_incidents_fk.sql` restaura `v3_supplier_incidents.purchase_order_id → v3_purchase_orders(hotel_id, id)` con limpieza previa de huérfanos.
- **Capa TS**: dominio `GoodsReceipt`, `GoodsReceiptLine`, `GR_QUALITY_STATUSES`, schemas de recepción, invariants `validateGRLine` y `calculatePOStatusAfterReceipt`, infraestructura `gr-queries.ts`/`gr-rpcs.ts`, hooks `useGoodsReceipts`, `useGoodsReceipt`, `useReceiveGoods`.
- **UI mínima operativa**: `/procurement/purchase-orders/[id]`, `/procurement/purchase-orders/[id]/receive`, `/procurement/goods-receipts`, `/procurement/goods-receipts/[id]`; entrada "Recepciones" en Compras; botón "Recibir mercancía" para PO `sent`/`received_partial`.
- **Errores procurement alineados con PR #62**: `domain/errors.ts` extiende `NotFoundError`/`ConflictError` desde `@/lib/errors`.

### Decisiones

- Una línea `quality_status='rejected'` crea GR line auditada, pero no suma cantidad útil a `v3_purchase_order_lines.quantity_received` ni genera `v3_price_change_log`. El PO queda `received_partial`.
- `delivery_note_image_hash` y `delivery_note_image_path` quedan solo como columnas preparatorias. OCR, upload, deduplicación por hash en UI y cascada automática cross-recipe pasan a sprint-05c.
- `GR_QUALITY_VARIANT.rejected` usa el token visual `warning`, que en el tema ChefOS es el acento bronce.

### Verificación local

- `npm test -- --run`: verde, 364 tests.
- `npm run typecheck`: verde.
- `npm run lint`: verde.
- `npx playwright test e2e/tests/procurement-receive-flow.spec.ts --project=chromium`: spec creado y ejecutable; quedó `skipped` en esta sesión porque la DB remota disponible no exponía aún `v3_goods_receipts`.

### Smoke real previsto tras aplicar migraciones en `dbtrgnyfmzqsrcoadcrs`

- PR manual: 3 kg solomillo con oferta preferida a 12.00 EUR/kg.
- Aprobar PR → consolidar PO → enviar PO.
- Recibir 1.5 kg a 12.00 → PO `received_partial`, sin entrada en `v3_price_change_log`.
- Recibir 1.5 kg a 12.50 → PO `received_complete`, `price_changes_logged=1`, `delta_pct=4.1667`.
- Crear segunda PO y recibir línea `rejected` con `rejection_reason='Temperatura fuera de rango'` → GR visible en detalle y PO `received_partial`.
- Cross-tenant: usuario del hotel A llama `v3_receive_goods` con hotel B → error de membership; SELECT `v3_goods_receipts` hotel B → `[]`.

### Pendiente 05c

- Edge Function OCR de albaranes.
- Upload storage + SHA-256 cliente.
- Cola de revisión OCR.
- Cascada automática de precios a recetas/escandallos al detectar cambios.

---

## Cierre 05c — 2026-04-26

### Entregado

- **Storage OCR**: migración `00068_v3_procurement_ocr_storage.sql` crea bucket privado `v3-procurement-uploads` con policies por membership y path `<hotel_id>/<sha256>.<ext>`.
- **Jobs OCR**: migración `00069_v3_procurement_ocr_jobs.sql` crea enum `v3_ocr_job_status`, tabla `v3_procurement_ocr_jobs`, índices, RLS y trigger `updated_at`.
- **RPCs OCR**: migración `00070_v3_procurement_ocr_rpcs.sql` añade create/extracted/failed/review/apply/reject. `v3_apply_ocr_job` llama `v3_receive_goods`, guarda `applied_goods_receipt_id` y ejecuta `v3_sync_escandallo_prices` para recetas afectadas. Migración `00071_v3_procurement_ocr_service_role_guard.sql` corrige las RPCs internas service-role tras smoke real.
- **Edge Function**: `supabase/functions/v3-procurement-ocr-extract` valida JWT, membership, rate limit Upstash 10/hotel/hora, descarga Storage, llama Claude Vision `claude-sonnet-4-6` y persiste payload extraído.
- **Capa TS**: schemas OCR, errores de dominio, wrappers RPC/query/storage y hooks TanStack Query.
- **UI**: `/procurement/ocr/upload`, `/procurement/ocr/jobs`, `/procurement/ocr/jobs/[id]` con preview PDF/imagen, revisión editable, aplicar y rechazar.
- **Tests**: unit de schemas/helpers/hooks y spec Playwright `procurement-ocr-flow.spec.ts` gated por `OCR_E2E_LIVE=1`.

### Decisiones

- El OCR no crea GR directamente: siempre pasa por estado `reviewed` y acción humana "Aplicar".
- La deduplicación se hace por `sha256` y `(hotel_id, sha256)`.
- Si faltan variables Upstash en Edge Function, se registra warning y se permite continuar; si falta `ANTHROPIC_API_KEY`, la extracción falla.
- `v3_apply_ocr_job` queda limitada a roles que pueden sincronizar escandallos.

### Verificación local

- `npm test -- --run`: verde, 380 tests tras UI.
- `npm run typecheck`: verde.
- `npm run lint`: verde.

### Pendiente operativo

- WALL-E debe aplicar `00071` en `dbtrgnyfmzqsrcoadcrs`, revisar advisors y regenerar `src/types/database.ts` si cambia.
- Desplegar Edge Function con `supabase functions deploy v3-procurement-ocr-extract`.
- Configurar secrets `ANTHROPIC_API_KEY`, `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` en Supabase Functions.
