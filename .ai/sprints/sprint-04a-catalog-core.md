# ChefOS v3 Sprint 04a — Catalog Core (products + units + aliases + mapping import)

## Objetivo

Entregar la base mínima del módulo `catalog` que desbloquea el estado "mapping pendiente" de ingredientes dejado por sprint-03c. Al cerrar este sub-sprint, una receta importada desde Excel puede resolver sus ingredientes a `product_id` / `unit_id` reales.

Referencia paraguas: [sprint-04-catalog.md](./sprint-04-catalog.md). Ver ADR-0014 en decisions-log.

## Alcance

### Incluye

- Extensión `pg_trgm` (búsqueda fuzzy sobre name + alias).
- Tablas: `units`, `unit_conversions`, `hotel_unit_overrides`, `product_categories`, `products`, `product_aliases`, `price_history` (tabla solo, sin triggers — poblada desde 04b/04c).
- Frontera pública `src/features/catalog/index.ts` exponiendo: `Product`, `ProductCategory`, `ProductAlias`, `Unit`, `UnitConversion`, hooks CRUD y `useResolveMappingBulk`.
- RPCs: `add_product_alias`, `match_product_by_alias(p_hotel_id uuid, p_query text, p_limit int) → jsonb`, `resolve_ingredient_mapping_bulk(p_hotel_id uuid, p_mapping jsonb) → jsonb`.
- Seed unidades globales: `g`, `kg`, `ml`, `l`, `ud`, `caja`, `docena`, `cucharada`, `cucharadita`. Conversiones básicas (g↔kg, ml↔l).
- UI:
  - `/catalog/products` (listado + create/edit inline) con búsqueda trigram.
  - `/catalog/products/[id]` (detalle + gestor de alias).
  - `/catalog/categories` (CRUD categorías por hotel, roles admin/direction/superadmin).
  - `/catalog/units` (listado global + panel override por hotel, solo superadmin/direction).
  - `/recipes/mapping` (pantalla global: lista recetas con ingredientes NULL, mapping inline con autocompletar trigram).
- Tests: ~25 (Zod schemas, hooks con mock TanStack, RPC integration, e2e create product → alias → import xlsx → mapping).

### No incluye (04b/04c)

- Proveedores, `SupplierConfig`, `SupplierOffer`, `ProductSupplierRef`.
- Incidencias, métricas, eventos de dominio, precedencia GR > offer > manual.
- Triggers automáticos sobre `price_history` (la tabla existe pero se alimenta en 04b al crear/actualizar ofertas).

## Migraciones

- `00055_sprint04a_units.sql` — extensión pg_trgm + `units` (global) + `unit_conversions` + `hotel_unit_overrides` + seed + RLS.
- `00056_sprint04a_products.sql` — `product_categories` (hotel) + `products` + `price_history` (estructura) + índices GIN trigram en `products.name` + RLS.
- `00057_sprint04a_aliases.sql` — `product_aliases` + índice GIN trigram + RPC `add_product_alias` + RPC `match_product_by_alias`.
- `00058_sprint04a_mapping.sql` — RPC `resolve_ingredient_mapping_bulk` (SECURITY DEFINER, check_membership admin/direction/superadmin, actualiza `recipe_ingredients` por `recipe_id + ingredient_name`).

Reglas: dollar tags nombrados por bloque (lección 00054). Aplicar en orden. Cada migración idempotente (`create if not exists`, `do $tag$ ... $tag$`).

## Contratos públicos

`src/features/catalog/index.ts` expone:

```typescript
// Types
export type { Product, ProductCategory, ProductAlias, Unit, UnitConversion, HotelUnitOverride } from './domain/types'
export { productSchema, productCategorySchema, unitSchema, aliasSchema, mappingPayloadSchema } from './domain/schemas'

// Hooks
export { useProducts, useProduct, useCreateProduct, useUpdateProduct, useDeleteProduct } from './application/use-products'
export { useProductCategories, useCreateProductCategory } from './application/use-product-categories'
export { useUnits, useUnitConversions, useSetHotelUnitOverride } from './application/use-units'
export { useProductAliases, useAddAlias, useRemoveAlias, useMatchProductByAlias } from './application/use-product-aliases'
export { useResolveMappingBulk } from './application/use-resolve-mapping'
```

No exponer `infrastructure/` ni `domain/` internos. No hacer que otros módulos importen de `catalog/infrastructure/*`.

## Criterios de done

- [ ] Typecheck 0, lint 0, tests verdes (todos los previos + ~25 nuevos).
- [ ] Build OK con rutas nuevas registradas.
- [ ] Migraciones 00055-00058 aplicadas en Supabase compartido.
- [ ] Receta importada desde xlsx con ingredientes NULL: mapeable 100% desde `/recipes/mapping`.
- [ ] `match_product_by_alias` con 5 productos + 3 alias cada uno devuelve ≥90% accuracy en búsquedas por nombre parcial.
- [ ] Search trigram en `/catalog/products` responde <300ms con 500 productos seed.
- [ ] RLS verificado: usuario de hotel A no ve productos de hotel B (e2e).
- [ ] Capability matrix (`README.md` de catalog) actualizada.
- [ ] ADR-0014 mencionado en el PR.

## Riesgos específicos

- **Mapping por `ingredient_name`**: el RPC debe ser tolerante (trim + lower) pero no puede romper si dos ingredientes comparten nombre. Resolver por `(recipe_id, ingredient_name)` estricto; devolver error si ambiguo.
- **pg_trgm coste**: índices GIN pesan; acotar a `products.name`, `product_aliases.alias`, `product_categories.name`. No activar en tablas grandes sin análisis.
- **Units globales vs override hotel**: UI debe resolver al leer, cachear en hook. NO hacer joins caros en cada query.

## Orden de ejecución

1. Migraciones 00055-00058 (en orden, aplicar cada una y probar antes de siguiente).
2. `domain/types.ts` + `domain/schemas.ts`.
3. `infrastructure/*-queries.ts` + `*-mutations.ts`.
4. `application/use-*.ts`.
5. `components/` (ProductsTable, ProductForm, AliasManager, UnitsPanel, MappingTable).
6. Rutas `/catalog/*` + `/recipes/mapping`.
7. Tests en paralelo con cada bloque.
8. Smoke manual: import xlsx → mapping global → escandallo.
9. PR.
