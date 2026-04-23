/**
 * Contrato público del módulo `catalog` — sprint-04a (ADR-0014).
 *
 * Owner v3: productos, categorías, unidades (per-hotel), alias, mapping de
 * ingredientes de recipes → products+units. Capa de dominio sobre tablas v2
 * existentes (ADR-0003 Supabase compartido).
 *
 * NO exporta infraestructura (*-queries.ts). Solo tipos, schemas, helpers
 * domain y hooks application.
 */

// ── Types ────────────────────────────────────────────────────────────────────
export type {
  AliasSourceType,
  MappingEntry,
  MappingFailReason,
  MappingFailure,
  MappingResult,
  PriceHistory,
  Product,
  ProductAlias,
  ProductMatch,
  ProductMatchKind,
  ProductsFilter,
  ProductStorageType,
  UnitOfMeasure,
  UnitType,
} from './domain/types'

export {
  ALIAS_SOURCE_TYPES,
  PRODUCT_MATCH_KINDS,
  PRODUCT_STORAGE_TYPES,
  UNIT_TYPES,
} from './domain/types'

// ── Schemas Zod ──────────────────────────────────────────────────────────────
export {
  aliasInputSchema,
  aliasSchema,
  allergensSchema,
  mappingEntrySchema,
  mappingPayloadSchema,
  productInputSchema,
  productSchema,
  productsFilterSchema,
  unitOfMeasureSchema,
} from './domain/schemas'

export type { AliasInput, MappingPayload, ProductInput } from './domain/schemas'

// ── Invariants + labels ──────────────────────────────────────────────────────
export {
  ALIAS_SOURCE_LABELS,
  STORAGE_TYPE_LABELS,
  UNIT_TYPE_LABELS,
  convertUnit,
  dedupeMatchesByProduct,
  filterProductsClient,
  isProductEditable,
  mappingResultSummary,
  normalizeAllergens,
  normalizeIngredientName,
  validateMappingEntries,
} from './domain/invariants'

// ── Errors ───────────────────────────────────────────────────────────────────
export {
  AliasDuplicateError,
  AliasEmptyError,
  CategoryNotFoundError,
  MappingAmbiguousError,
  MappingNoMatchError,
  ProductNotFoundError,
  ProductWrongHotelError,
  UnitWrongHotelError,
} from './domain/errors'

// ── Application hooks (client) ───────────────────────────────────────────────
export {
  useArchiveProduct,
  useCreateProduct,
  useProduct,
  useProducts,
  useRestoreProduct,
  useUpdateProduct,
} from './application/use-products'

export {
  useAddAlias,
  useMatchProductByAlias,
  useProductAliases,
  useRemoveAlias,
} from './application/use-product-aliases'

export { useUnits, useUnitsByType } from './application/use-units'

export { useProductCategories } from './application/use-product-categories'

export {
  useResolveMappingBulk,
  useUnmappedIngredients,
} from './application/use-resolve-mapping'
