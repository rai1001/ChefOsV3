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
  CatalogPrice,
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
  ProductSupplierRef,
  Supplier,
  SupplierConfig,
  SupplierOffer,
  SuppliersFilter,
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
  offerInputSchema,
  productInputSchema,
  productSchema,
  productsFilterSchema,
  supplierConfigInputSchema,
  supplierInputSchema,
  suppliersFilterSchema,
  unitOfMeasureSchema,
} from './domain/schemas'

export type {
  AliasInput,
  MappingPayload,
  OfferInput,
  ProductInput,
  SupplierConfigInput,
  SupplierInput,
} from './domain/schemas'

// ── Invariants + labels ──────────────────────────────────────────────────────
export {
  ALIAS_SOURCE_LABELS,
  STORAGE_TYPE_LABELS,
  UNIT_TYPE_LABELS,
  convertUnit,
  dedupeMatchesByProduct,
  filterProductsClient,
  filterSuppliersClient,
  formatCatalogPrice,
  groupOffersBySupplier,
  isOfferDateRangeValid,
  isOfferValidNow,
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
  OfferInvalidDateRangeError,
  OfferNotFoundError,
  ProductNotFoundError,
  ProductWrongHotelError,
  SupplierNotFoundError,
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

// Sprint-04b — suppliers + offers + prices
export {
  useArchiveSupplier,
  useCreateSupplier,
  useRestoreSupplier,
  useSupplier,
  useSuppliers,
  useUpdateSupplier,
} from './application/use-suppliers'

export {
  useSupplierConfig,
  useUpsertSupplierConfig,
} from './application/use-supplier-config'

export {
  useCreateOffer,
  useDeleteOffer,
  useMarkOfferPreferred,
  useOffersByProduct,
  useOffersBySupplier,
  useUpdateOffer,
} from './application/use-supplier-offers'

export {
  useProductSupplierRefs,
  useRefsBySupplier,
} from './application/use-product-supplier-refs'

export { useCatalogPrices } from './application/use-catalog-prices'
