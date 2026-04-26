// Invariants del módulo catalog — sprint-04a.
// Funciones puras de dominio: labels, validaciones de negocio, helpers.

import type {
  AliasSourceType,
  CatalogPrice,
  MappingEntry,
  MappingResult,
  Product,
  ProductMatch,
  ProductStorageType,
  Supplier,
  SupplierOffer,
  UnitOfMeasure,
  UnitType,
} from './types'

// ─── Labels i18n (ES) ─────────────────────────────────────────────────────────

export const STORAGE_TYPE_LABELS: Record<ProductStorageType, string> = {
  ambient: 'Ambiente',
  refrigerated: 'Refrigerado',
  frozen: 'Congelado',
}

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  weight: 'Peso',
  volume: 'Volumen',
  count: 'Unidad',
  length: 'Longitud',
}

export const ALIAS_SOURCE_LABELS: Record<AliasSourceType, string> = {
  manual: 'Manual',
  ocr: 'OCR albarán',
  excel: 'Excel',
  import: 'Import',
}

// ─── Normalización ingredient_name (coincide con RPC SQL) ─────────────────────

/**
 * Normaliza un ingredient_name igual que hace el RPC `resolve_ingredient_mapping_bulk`:
 * trim + lowercase. Usar antes de buscar match manual en UI.
 */
export function normalizeIngredientName(name: string): string {
  return name.trim().toLowerCase()
}

// ─── Helpers alérgenos ────────────────────────────────────────────────────────

/**
 * Normaliza el campo `allergens` (jsonb, puede venir como array u objeto).
 * Devuelve siempre string[] para uso consistente en UI.
 */
export function normalizeAllergens(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === 'string')
  }
  if (raw && typeof raw === 'object') {
    // Compatibilidad: si viene como { gluten: true, lactose: false }
    const result: string[] = []
    for (const key in raw as Record<string, unknown>) {
      if ((raw as Record<string, unknown>)[key] === true) {
        result.push(key)
      }
    }
    return result
  }
  return []
}

// ─── Helpers unidades ─────────────────────────────────────────────────────────

/**
 * Convierte una cantidad de `from` a `to` aplicando conversion_factor.
 * Cada unidad guarda factor relativo a su base_unit_id dentro del mismo unit_type.
 * qty_base = qty_from * from.conversion_factor
 * qty_to   = qty_base / to.conversion_factor
 */
export function convertUnit(
  qty: number,
  from: Pick<UnitOfMeasure, 'unit_type' | 'conversion_factor'>,
  to: Pick<UnitOfMeasure, 'unit_type' | 'conversion_factor'>
): number | null {
  if (from.unit_type !== to.unit_type) return null
  if (to.conversion_factor === 0) return null
  const qtyBase = qty * from.conversion_factor
  return qtyBase / to.conversion_factor
}

// ─── Helpers match (ranking de sugerencias alias) ─────────────────────────────

/**
 * Ordena matches por (similarity) y filtra duplicados por product_id quedándose
 * con el de mayor similarity. El RPC ya hace esto; este helper lo replica para
 * fusionar resultados de varios queries en cliente.
 */
export function dedupeMatchesByProduct(matches: ProductMatch[]): ProductMatch[] {
  const byProduct = new Map<string, ProductMatch>()
  for (const m of matches) {
    const current = byProduct.get(m.product_id)
    if (!current || m.similarity > current.similarity) {
      byProduct.set(m.product_id, m)
    }
  }
  return Array.from(byProduct.values()).sort((a, b) => b.similarity - a.similarity)
}

// ─── Mapping: resumen legible ─────────────────────────────────────────────────

export function mappingResultSummary(result: MappingResult): string {
  const parts: string[] = []
  parts.push(`${result.ok_count} mapeado${result.ok_count === 1 ? '' : 's'}`)
  if (result.failed_count > 0) {
    parts.push(`${result.failed_count} con error`)
  }
  return parts.join(', ')
}

/**
 * Valida un payload antes de enviar al RPC. Detecta claves vacías, duplicados
 * dentro del mismo recipe_id + ingredient_name (que produciría ambigüedad en server).
 */
export function validateMappingEntries(entries: MappingEntry[]): {
  valid: MappingEntry[]
  duplicates: string[]
} {
  const seen = new Set<string>()
  const duplicates: string[] = []
  const valid: MappingEntry[] = []

  for (const entry of entries) {
    if (!entry.recipe_id || !entry.ingredient_name.trim()) continue
    const key = `${entry.recipe_id}|${normalizeIngredientName(entry.ingredient_name)}`
    if (seen.has(key)) {
      duplicates.push(entry.ingredient_name)
      continue
    }
    seen.add(key)
    valid.push(entry)
  }
  return { valid, duplicates }
}

// ─── Helpers listado producto ─────────────────────────────────────────────────

export function isProductEditable(product: Pick<Product, 'is_active'>): boolean {
  return product.is_active
}

/**
 * Filtra productos en cliente por search text (match sobre name + description).
 * NO reemplaza la búsqueda server-side con trigram; es para filtrado secundario.
 */
export function filterProductsClient(
  products: Product[],
  search: string
): Product[] {
  const q = search.trim().toLowerCase()
  if (!q) return products
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      (p.description?.toLowerCase().includes(q) ?? false) ||
      (p.sku?.toLowerCase().includes(q) ?? false)
  )
}

// ─── Sprint-04b: Suppliers + Offers ───────────────────────────────────────────

export function filterSuppliersClient(
  suppliers: Supplier[],
  search: string
): Supplier[] {
  const q = search.trim().toLowerCase()
  if (!q) return suppliers
  return suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      (s.contact_name?.toLowerCase().includes(q) ?? false) ||
      (s.tax_id?.toLowerCase().includes(q) ?? false) ||
      (s.email?.toLowerCase().includes(q) ?? false)
  )
}

/**
 * Determina si una oferta está vigente hoy.
 */
export function isOfferValidNow(
  offer: Pick<SupplierOffer, 'valid_from' | 'valid_to'>,
  today: Date = new Date()
): boolean {
  const iso = today.toISOString().slice(0, 10)
  if (offer.valid_from && offer.valid_from > iso) return false
  if (offer.valid_to && offer.valid_to < iso) return false
  return true
}

/**
 * Valida rango de fechas de oferta antes de submit.
 */
export function isOfferDateRangeValid(
  valid_from: string | null | undefined,
  valid_to: string | null | undefined
): boolean {
  if (!valid_from || !valid_to) return true
  return valid_from <= valid_to
}

/**
 * Formatea un CatalogPrice a string legible ES.
 */
export function formatCatalogPrice(cp: CatalogPrice): string {
  if (cp.price === null) return 'Sin precio'
  const formatted = cp.price.toLocaleString('es-ES', {
    style: 'currency',
    currency: cp.currency ?? 'EUR',
  })
  if (cp.source === 'offer_preferred') return `${formatted} (preferida)`
  if (cp.source === 'offer_cheapest') return `${formatted} (más barata)`
  return formatted
}

/**
 * Agrupa ofertas por supplier_id para UI (tabla supplier → sus ofertas).
 */
export function groupOffersBySupplier(
  offers: SupplierOffer[]
): Record<string, SupplierOffer[]> {
  const map: Record<string, SupplierOffer[]> = {}
  for (const o of offers) {
    const bucket = map[o.supplier_id] ?? (map[o.supplier_id] = [])
    bucket.push(o)
  }
  return map
}
