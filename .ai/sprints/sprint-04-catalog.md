# ChefOS v3 Sprint 04 - Catalog

## Objetivo del sprint

Construir la base funcional inicial del módulo `catalog` dentro de la arquitectura oficial de ChefOS v3, con alcance cerrado y orientado a estabilizar el contrato base del dominio de catálogo del sistema.

Este sprint no existe para resolver toda la oferta comercial u operativa del producto.

Existe para definir y estabilizar la primera base operativa del módulo `catalog`.

---

## Estado del sprint

- Módulo principal: `catalog`
- Tipo de sprint: funcional
- Alcance: pequeño y cerrado
- Dependencias directas:
  - `sprint-00-foundation`
  - `sprint-01-identity`
- Multi-tenant, permisos y límites de módulo: obligatorios

---

## Propósito del módulo `catalog`

El módulo `catalog` es responsable del dominio de catálogo dentro del sistema.

Debe actuar como owner de los contratos relacionados con:

- entidad catalogable base
- estructura mínima de catálogo
- agrupación, clasificación o visibilidad básica
- estado base de catálogo
- reglas mínimas de validación del dominio
- contratos públicos que otros módulos puedan consumir sin invadir internals

No debe convertirse en owner de lógica comercial, formulación de recetas, inventario o producción.

---

## Objetivo funcional exacto del sprint

Dejar definido e implementable el contrato base de `catalog` para que el sistema pueda manejar, de forma explícita y controlada:

- la entidad catalogable base del dominio
- su estructura mínima de clasificación o visibilidad
- su estado funcional inicial
- el acceso controlado a esa información desde otros módulos
- la frontera pública del módulo sin acceso caótico desde UI o páginas

---

## Resultado esperado

Al cerrar este sprint, el proyecto debe tener una primera base clara para `catalog` que permita:

- encapsular la lógica mínima del dominio de catálogo
- exponer contratos públicos base del módulo
- evitar acceso caótico al catálogo desde páginas o componentes
- preparar el terreno para procesos posteriores que dependan de catálogo
- permitir que futuros módulos consuman `catalog` mediante contrato público claro

---

## Alcance del sprint

### Incluye

- definición del ownership del módulo `catalog`
- definición de frontera pública del módulo
- definición de contratos base del dominio de catálogo
- definición de inputs y outputs mínimos del módulo
- diseño cerrado de la entidad catalogable base y su estructura mínima
- validación de restricciones base de acceso cuando aplique
- tests necesarios para el contrato base del módulo

### No incluye

- pipeline comercial completo
- formulación de recetas
- procurement de ítems o insumos
- control de stock o movimientos de inventario
- ejecución de producción
- integraciones externas del catálogo
- automatizaciones sobre catálogo
- migración masiva de legacy de catálogo
- cambios funcionales en módulos no relacionados

---

## Módulo afectado

- `catalog`

### Módulos no objetivo en este sprint

No deben tocarse funcionalmente salvo dependencia mínima y explícita:

- commercial
- recipes
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

1. Definir qué pertenece realmente a `catalog`.
2. Evitar acceso improvisado a catálogo desde cualquier parte del sistema.
3. Fijar el contrato base que otros módulos podrán consumir.
4. Obligar a que datos, permisos y tenant del dominio de catálogo se traten de forma explícita.
5. Sentar una base revisable y testeable para crecimiento posterior.

---

## Problemas que este sprint no debe intentar resolver

1. Toda la estrategia comercial del sistema.
2. Toda la relación entre catálogo y recipes.
3. Toda la relación entre catálogo e inventory.
4. Toda la lógica de integraciones del catálogo.
5. Toda la automatización asociada a publicación o sincronización.
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

Los entregables esperados de Sprint 04 son los mínimos necesarios para dejar una base estable del módulo `catalog`.

### 1. Definición operativa del módulo

Debe quedar claro:

- propósito
- frontera funcional
- ownership
- fuera de alcance
- dependencias autorizadas

### 2. Contratos públicos base del módulo

Debe quedar claro cómo exponer, como mínimo:

- entidad catalogable base
- estructura mínima de clasificación o visibilidad
- estado base de catálogo
- consulta de entidad de catálogo por contrato público
- mutación base cuando aplique
- restricciones mínimas de acceso asociadas

### 3. Estructura inicial del módulo

El módulo debe encajar en:

```txt
src/features/catalog/
```

Con estructura proporcional a su necesidad real y alineada con module-template.md.

### 4. Base de validación

Deben quedar definidos y/o implementados los tests necesarios para proteger:

- contrato del módulo
- datos mínimos de catálogo
- restricciones base de acceso
- escenarios permitidos y denegados cuando apliquen

---

## Criterios de cierre del sprint

Sprint 04 solo se considera cerrado cuando:

- `catalog` tiene responsabilidad funcional clara.
- Existe frontera pública clara del módulo.
- La entidad catalogable base no depende de acceso caótico desde UI o páginas.
- El contrato base del módulo está definido con claridad.
- Permisos y tenancy fueron tratados explícitamente.
- El sprint no mezcló trabajo de otros módulos.
- Hay validación suficiente según riesgo.
- El resultado deja base real para procesos posteriores que dependan de catálogo.

---

## Tareas del sprint

### Tarea 04.01 - Definir responsabilidad exacta del módulo catalog

**Objetivo:**

- fijar qué pertenece al módulo
- fijar qué queda fuera
- fijar ownership funcional

**Salida esperada:**

- definición cerrada del alcance del módulo

### Tarea 04.02 - Definir contrato público base de catalog

**Objetivo:**

- establecer qué debe exponer públicamente el módulo
- evitar acceso informal a internals
- preparar consumo controlado desde otros módulos

**Salida esperada:**

- contrato público base documentado o implementado

### Tarea 04.03 - Definir entidad catalogable base, estructura mínima y estado inicial

**Objetivo:**

- fijar la pieza mínima del dominio de catálogo sobre la que crecerá el módulo
- dejar claros sus datos mínimos y su estado funcional inicial

**Salida esperada:**

- modelo base del dominio de catálogo definido por contrato

### Tarea 04.04 - Validar restricciones base de acceso y tenancy

**Objetivo:**

- asegurar que el contrato inicial no ignora aislamiento multi-tenant
- proteger escenarios permitidos y denegados del dominio de catálogo

**Salida esperada:**

- reglas base de acceso asociadas al módulo

### Tarea 04.05 - Definir tests del contrato base del módulo

**Objetivo:**

- asegurar cobertura mínima sobre comportamiento, permisos y límites del módulo

**Salida esperada:**

- cobertura mínima de validación para contrato, tenancy y acceso

### Tarea 04.06 - Revisar el módulo contra arquitectura y definition of done

**Objetivo:**

- asegurar que `catalog` queda bien ubicado
- asegurar que no invade otros módulos
- asegurar que el sprint cierra de forma verificable

**Salida esperada:**

- validación estructurada del sprint

---

## Riesgos del sprint

### Riesgo 1. Intentar resolver toda la complejidad del dominio de catálogo

- **Mitigación:** limitar el sprint al contrato base y a la entidad catalogable mínima del módulo

### Riesgo 2. Mezclar catalog con commercial, recipes, inventory o integrations

- **Mitigación:** mantener ownership estricto y no introducir lógica de otros dominios dentro del módulo

### Riesgo 3. Acabar con un módulo ambiguo o demasiado abstracto

- **Mitigación:** exigir contratos concretos, entradas claras y salidas claras

### Riesgo 4. Ignorar multi-tenant al definir catálogo

- **Mitigación:** tratar tenant y permisos como parte obligatoria del contrato base

### Riesgo 5. Poner lógica de catálogo en páginas, layouts o componentes

- **Mitigación:** concentrar la lógica del módulo en `src/features/catalog/` y exponer frontera pública

---

## Validación del sprint

Antes de cerrar Sprint 04, debe poder responderse:

- ¿está claro qué pertenece a `catalog`?
- ¿el resto del sistema puede consumir `catalog` sin invadir internals?
- ¿la entidad catalogable base, su estructura mínima y su estado inicial tienen contrato claro?
- ¿permisos y tenancy fueron considerados explícitamente?
- ¿el sprint evitó mezclar tareas de otros módulos?
- ¿hay tests proporcionales al riesgo?
- ¿la base creada permite avanzar al siguiente sprint sin caos?

Si alguna respuesta crítica es no, Sprint 04 no está cerrado.

---

## Definition of Done del sprint

Sprint 04 está done solo cuando:

- el módulo `catalog` tiene frontera clara
- el contrato base del módulo existe y es comprensible
- la entidad catalogable base está tratada como concern oficial del módulo
- permisos y multi-tenant fueron contemplados cuando aplicaban
- el trabajo respeta arquitectura, workflow y standards
- no se mezcló rediseño global ni trabajo lateral
- el sprint deja una salida concreta, verificable y reutilizable

---

## Preparación para sprints posteriores

Una vez cerrado Sprint 04, el proyecto debería quedar listo para que módulos posteriores puedan consumir `catalog` con un contrato estable, en lugar de resolver catálogo de forma dispersa.

Los siguientes sprints deberán construirse sobre esta base, no rodearla.

---

## Estado de este documento

Este archivo define el Sprint 04 oficial del módulo `catalog` en ChefOS v3.

Su función es continuar la fase funcional del proyecto con un alcance pequeño, controlado y compatible con la arquitectura oficial.

---

## Detalle específico del dominio (heredado de v2)

Absorbe `docs/MODULO_PRODUCTOS.md` + `docs/MODULO_PROVEEDORES.md` de v2. Migraciones: `00007_m3_catalog` + `00014_catalog_prices` + `00015_m3_extended` + fix `00038_fix_inventory_catalog_columns`.

### Funcionalidades principales

**Productos (catálogo maestro)**
- Importar productos por hotel desde Excel (alta + update).
- Separar **Producto** (interno) de **ReferenciaProveedor** (SKU) para evitar duplicados multi-proveedor.
- Clave única: `hotel_id + proveedor_id + codigo_proveedor` (o fallback `hotel + proveedor + nombre_normalizado + formato`).
- 12 categorías default + personalizables.
- Unidad stock vs unidad compra + factor_conversion.
- Proveedor preferido + referencia preferida (para compras automáticas).
- Alias de producto (mejora OCR matching).

**Proveedores (motor silencioso)**
- Configuración operativa: días entrega, hora corte, lead time, pedido mínimo, ventana recepción.
- Incidencias automáticas: retraso, falta_producto, sustitucion, error_referencia, calidad.
- Métricas automáticas: % pedidos completos, % entregas a tiempo, incidencias últimos 30 días.
- Alertas: INFO / AVISO / CRÍTICO.

### Modelo de datos

Productos:
- `Product` — hotel_id, nombre, categoria_id, unidad_stock, proveedor_preferido_id, referencia_preferida_id, activo.
- `ProductCategory` — hotel_id, nombre, orden.
- `ProductAlias` — hotel_id, product_id, alias (para OCR matching).
- `PriceHistory` — referencia_proveedor_id, precio_anterior, precio_nuevo, fecha, origen.

Proveedores:
- `Supplier` — hotel_id, nombre_comercial, tipo, contacto, email_pedidos, activo.
- `SupplierConfig` — supplier_id, dias_entrega, hora_corte_pedido, lead_time_min_horas, pedido_minimo_importe, ventana_recepcion_inicio/fin.
- `SupplierOffer` — supplier_id, product_id, codigo_proveedor, unidad_compra, contenido_compra, factor_conversion, precio, moneda, iva, is_preferred.
- `SupplierIncident` — supplier_id, pedido_id, tipo, gravedad, impacto_evento, comentario, fecha.
- `ProductSupplierRef` — product_id, supplier_id, codigo (fast lookup).

### Contratos públicos (`src/features/catalog/index.ts`)

Types: `Product`, `ProductCategory`, `ProductAlias`, `Supplier`, `SupplierConfig`, `SupplierOffer`, `SupplierIncident`, `PriceHistory`, `PRODUCT_CATEGORIES_DEFAULT`, `INCIDENT_TYPES`, `INCIDENT_SEVERITIES`.

Hooks:
- `useProducts(filters?)`, `useProduct(id)`
- `useCreateProduct()`, `useUpdateProduct()`, `useImportProducts()` (Excel batch)
- `useAliases(productId)`, `useAddAlias()`
- `useSuppliers()`, `useSupplier(id)`
- `useCreateSupplier()`, `useUpdateSupplier()`, `useSupplierConfig(id)`
- `useSupplierOffers(supplierId)`, `useSupplierIncidents(supplierId)`, `useRecordIncident()`
- `useCatalogPrices(productIds)` — para escandallo live

### Casos de uso (`application/`)

- `use-products.ts`, `use-product.ts`, `use-create-product.ts`, `use-import-products.ts`
- `use-suppliers.ts`, `use-supplier.ts`
- `use-supplier-offers.ts`, `use-supplier-incidents.ts`, `use-record-incident.ts`
- `use-catalog-prices.ts`

### RPCs consumidas

- `create_product`, `update_product`, `import_products_batch` (validación + upsert por clave)
- `add_product_alias`
- `create_supplier`, `update_supplier`
- `create_supplier_offer`, `update_supplier_offer`, `mark_offer_preferred`
- `record_supplier_incident`, `get_supplier_metrics(p_supplier_id)`
- `get_catalog_prices(p_product_ids[])` — GR price > offer price > manual
- `match_product_by_alias(p_hotel_id, p_query)` — consumido por OCR (sprint-05)

### Eventos de dominio

Emite: `product.created`, `product.price_changed`, `supplier.offer_updated`, `proveedor.incidencia_created`.

Consume: `pedido.received_partial` → si hay faltantes recurrentes, sugerir registrar incidencia.

### Tests mínimos

Unit: clave única de import (hotel+proveedor+codigo), conversión unidades (caja → unidad), ranking de match_product_by_alias.

Integration: import Excel con 100 productos duplica correctamente (update vs insert), offer.is_preferred único por producto.

E2E: crear proveedor → añadir SupplierConfig → crear SupplierOffer → marcar preferida → al crear PR en sprint-05, sugerencia automática del proveedor.

### Criterio de done específico

- [ ] Import Excel con 500 productos en <60s sin duplicados.
- [ ] `match_product_by_alias` ≥90% accuracy con ≥3 alias por producto.
- [ ] `get_catalog_prices` respeta precedencia GR > offer > manual.
- [ ] Incidencias generadas automáticamente al recibir GR partial.
- [ ] Métricas de proveedor actualizadas tras cada GR.

### Referencias cruzadas

- `sprints/sprint-03-recipes.md` — ingredientes mapean a productos
- `sprints/sprint-05-procurement.md` — consumidor principal (PR/PO usa proveedor preferido + offers)
- `sprints/sprint-06-inventory.md` — consumidor (stock_lots referencia productos)
- `skills/catalog/`, `skills/ocr-delivery-notes-workflow/` (usa `match_product_by_alias`)
