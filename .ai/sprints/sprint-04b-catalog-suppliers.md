# ChefOS v3 Sprint 04b — Catalog Suppliers (suppliers + config + offers + precedencia offer)

## Objetivo

Entregar el maestro de proveedores + ofertas con SKU y conversión, y la precedencia de precios `offer > manual` que permite escandallo con precios reales. Habilita sprint-05-procurement.

Pre-requisito: sprint-04a cerrado y aplicado en prod.
Referencia paraguas: [sprint-04-catalog.md](./sprint-04-catalog.md). ADR-0014.

## Alcance

### Incluye

- Tablas: `suppliers`, `supplier_config`, `supplier_offers`, `product_supplier_refs`.
- RPCs: `create_supplier`, `update_supplier`, `create_supplier_offer`, `update_supplier_offer`, `mark_offer_preferred` (garantiza único `is_preferred=true` por `product_id`), `get_catalog_prices(p_product_ids uuid[]) → jsonb` (precedencia offer_preferred > offer_cheapest_valid > manual price en product).
- Vista `supplier_offers_current` (where `valid_to is null or valid_to > now()`).
- Trigger `price_history_from_offer` — al crear/actualizar `supplier_offers` con precio distinto, insert en `price_history` (la tabla ya existe desde 04a).
- Frontera pública `catalog/index.ts` extendida con: `Supplier`, `SupplierConfig`, `SupplierOffer`, `ProductSupplierRef`, hooks correspondientes.
- UI:
  - `/catalog/suppliers` (listado + create).
  - `/catalog/suppliers/[id]` con tabs: datos fiscales / config operativa (lead time, hora corte, ventana recepción, pedido mínimo) / ofertas (tabla con marcar preferred, editar vigencia).
  - Extensión `/catalog/products/[id]` → tab "Proveedores" (lista `ProductSupplierRef` + ofertas activas por proveedor).
- Tests: ~20.

### No incluye (04c)

- Incidencias, métricas auto, eventos de dominio.
- Precedencia GR > offer (requiere goods_receipts de sprint-05).

## Migraciones

- `00059_sprint04b_suppliers.sql` — `suppliers` + RLS.
- `00060_sprint04b_supplier_config.sql` — `supplier_config` (1-a-1 con supplier) + RLS + `created_at`/`updated_at`.
- `00061_sprint04b_supplier_offers.sql` — `supplier_offers` + índice compuesto + `valid_from`/`valid_to` + vista `supplier_offers_current` + trigger único `is_preferred` por producto + trigger price_history.
- `00062_sprint04b_product_supplier_refs.sql` — `product_supplier_refs` (product + supplier + codigo_proveedor) + RPC `get_catalog_prices` (precedencia offer > manual).

## Contratos públicos (delta sobre 04a)

```typescript
export type { Supplier, SupplierConfig, SupplierOffer, ProductSupplierRef } from './domain/types'
export { useSuppliers, useSupplier, useCreateSupplier, useUpdateSupplier } from './application/use-suppliers'
export { useSupplierConfig, useUpdateSupplierConfig } from './application/use-supplier-config'
export { useSupplierOffers, useCreateOffer, useUpdateOffer, useMarkOfferPreferred } from './application/use-supplier-offers'
export { useCatalogPrices } from './application/use-catalog-prices'
```

`useCatalogPrices(productIds)` es consumible desde `recipes` para escandallo real.

## Criterios de done

- [ ] Typecheck 0, lint 0, tests verdes (+ ~20 nuevos).
- [ ] Build OK.
- [ ] Migraciones 00059-00062 aplicadas.
- [ ] Flujo end-to-end: crear supplier → config → añadir 3 ofertas (1 preferred) → `useCatalogPrices` devuelve la preferred.
- [ ] Constraint `is_preferred` único por producto no rompe al editar (se des-preferencia la antigua automáticamente).
- [ ] `price_history` se popula al crear/actualizar oferta con precio distinto.
- [ ] RLS: hotel A no ve suppliers de hotel B.
- [ ] Capability matrix actualizada.

## Riesgos específicos

- **`mark_offer_preferred` race condition**: dos updates simultáneos pueden dejar 0 o 2 preferred. RPC debe usar `lock` explícito o `do update` con subquery que demarque "unset others + set this" en un único statement.
- **Trigger price_history en bucle**: si el update no filtra `price_new != price_old`, genera basura. Filtrar en el trigger.
- **Vigencia solapada**: dos ofertas del mismo proveedor+producto+unidad pueden solaparse en `valid_from`/`valid_to`. Decisión: permitir (casos reales: proveedor sube precio mid-semana). `supplier_offers_current` devuelve la de `valid_from` más reciente.
