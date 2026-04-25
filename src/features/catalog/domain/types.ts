// Dominio catalog — sprint-04a/04b (ADR-0014) sobre namespace v3_* (ADR-0015).
// Los tipos TS mantienen nombres limpios; el prefijo vive en infrastructure.

// ─── Enums DB (USER-DEFINED, prefijo v3_ en infrastructure) ───────────────────

// v3_products.storage_type
export const PRODUCT_STORAGE_TYPES = ['ambient', 'refrigerated', 'frozen'] as const
export type ProductStorageType = (typeof PRODUCT_STORAGE_TYPES)[number]

// v3_units_of_measure.unit_type
export const UNIT_TYPES = ['weight', 'volume', 'count', 'length'] as const
export type UnitType = (typeof UNIT_TYPES)[number]

// v3_product_aliases.source_type.
export const ALIAS_SOURCE_TYPES = ['manual', 'ocr', 'excel', 'import'] as const
export type AliasSourceType = (typeof ALIAS_SOURCE_TYPES)[number]

// match RPC return
export const PRODUCT_MATCH_KINDS = ['alias', 'name'] as const
export type ProductMatchKind = (typeof PRODUCT_MATCH_KINDS)[number]

// ─── Entidades (mirror schema v3_) ────────────────────────────────────────────

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

// ─── Sprint-04b: Suppliers + Offers + ProductSupplierRefs + Prices ────────────

export interface Supplier {
  id: string
  hotel_id: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  tax_id: string | null
  payment_terms: string | null
  delivery_days: unknown // jsonb
  min_order_amount: number | null
  rating: number
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SupplierConfig {
  id: string
  hotel_id: string
  supplier_id: string
  delivery_days: unknown // jsonb
  cutoff_time: string | null
  lead_time_hours: number | null
  min_order_amount: number | null
  min_order_units: number | null
  reception_window_start: string | null
  reception_window_end: string | null
  allows_urgent_delivery: boolean
  created_at: string
  updated_at: string
}

export interface SupplierOffer {
  id: string
  hotel_id: string
  supplier_id: string
  product_id: string
  unit_id: string | null
  unit_price: number
  min_quantity: number | null
  valid_from: string | null
  valid_to: string | null
  is_preferred: boolean
  sku_supplier: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ProductSupplierRef {
  id: string
  hotel_id: string
  product_id: string
  supplier_id: string
  supplier_code: string
  supplier_name: string | null
  purchase_unit_id: string | null
  conversion_factor: number
  notes: string | null
  created_at: string
  updated_at: string
}

// RPC get_catalog_prices result entry.
export interface CatalogPrice {
  product_id: string
  price: number | null
  unit_id: string | null
  supplier_id: string | null
  offer_id: string | null
  source: 'offer_preferred' | 'offer_cheapest' | null
  is_preferred: boolean | null
  currency: string
}

export interface SuppliersFilter {
  hotelId: string
  search?: string
  activeOnly?: boolean
}
