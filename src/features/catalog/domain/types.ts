// Dominio catalog — sprint-04a (ADR-0014 revisado 2026-04-23).
// Capa v3 sobre schema v2 existente (ADR-0003 Supabase compartido).
// v2 ya tiene: products, product_aliases, units_of_measure, suppliers,
// supplier_offers, supplier_configs, supplier_incidents, price_history,
// product_supplier_refs. v3 las consume sin paralelizar.

// ─── Enums v2 (USER-DEFINED en DB, valores literales aquí) ────────────────────

// products.storage_type (v2 enum verificado 2026-04-23)
export const PRODUCT_STORAGE_TYPES = ['ambient', 'refrigerated', 'frozen'] as const
export type ProductStorageType = (typeof PRODUCT_STORAGE_TYPES)[number]

// units_of_measure.unit_type (v2 enum verificado 2026-04-23)
export const UNIT_TYPES = ['weight', 'volume', 'count', 'length'] as const
export type UnitType = (typeof UNIT_TYPES)[number]

// product_aliases.source_type — enum v2, nombre de type pendiente verificar.
// Valores probables por análisis v2: manual, ocr, excel. Ajustar tras query.
export const ALIAS_SOURCE_TYPES = ['manual', 'ocr', 'excel', 'import'] as const
export type AliasSourceType = (typeof ALIAS_SOURCE_TYPES)[number]

// match RPC return
export const PRODUCT_MATCH_KINDS = ['alias', 'name'] as const
export type ProductMatchKind = (typeof PRODUCT_MATCH_KINDS)[number]

// ─── Entidades (mirror schema v2) ─────────────────────────────────────────────

export interface Product {
  id: string
  hotel_id: string
  category_id: string | null
  name: string
  description: string | null
  sku: string | null
  default_unit_id: string | null
  min_stock: number | null
  max_stock: number | null
  reorder_point: number | null
  allergens: unknown // jsonb — tipado fuerte en schemas.ts vía Zod
  storage_type: ProductStorageType
  shelf_life_days: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UnitOfMeasure {
  id: string
  hotel_id: string
  name: string
  abbreviation: string
  unit_type: UnitType
  conversion_factor: number
  base_unit_id: string | null
  is_default: boolean
  created_at: string
}

export interface ProductAlias {
  id: string
  hotel_id: string
  product_id: string
  alias_name: string
  source_type: AliasSourceType
  confidence_score: number
  created_at: string
}

export interface PriceHistory {
  // Schema exacto v2 por verificar si se toca en sprint-04b.
  id: string
  hotel_id: string
  product_id: string
  [key: string]: unknown
}

// ─── Tipos RPC resultado ──────────────────────────────────────────────────────

export interface ProductMatch {
  product_id: string
  product_name: string
  matched_text: string
  similarity: number
  match_kind: ProductMatchKind
  source_type: AliasSourceType | null
}

export interface MappingEntry {
  recipe_id: string
  ingredient_name: string
  product_id: string | null
  unit_id: string | null
}

export type MappingFailReason =
  | 'no_match'
  | 'ambiguous'
  | 'product_not_found'
  | 'product_wrong_hotel'
  | 'unit_not_found'
  | 'unit_wrong_hotel'
  | 'update_failed'
  | 'missing_keys'
  | 'exception'

export interface MappingFailure {
  recipe_id: string | null
  ingredient_name: string | null
  reason: MappingFailReason
  error?: string
}

export interface MappingResult {
  ok_count: number
  failed_count: number
  failed: MappingFailure[]
}

// ─── Filtros para queries ─────────────────────────────────────────────────────

export interface ProductsFilter {
  hotelId: string
  search?: string
  categoryId?: string | null
  activeOnly?: boolean
}
