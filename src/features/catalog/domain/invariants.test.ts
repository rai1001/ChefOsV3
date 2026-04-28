import { describe, expect, it } from 'vitest'
import {
  convertUnit,
  dedupeMatchesByProduct,
  filterProductsClient,
  mappingResultSummary,
  normalizeAllergens,
  normalizeIngredientName,
  validateMappingEntries,
} from './invariants'
import type { Product, ProductMatch } from './types'

describe('normalizeIngredientName', () => {
  it('trim + lower', () => {
    expect(normalizeIngredientName('  TOMATE  ')).toBe('tomate')
    expect(normalizeIngredientName('Aceite de Oliva')).toBe('aceite de oliva')
  })
})

describe('normalizeAllergens', () => {
  it('string array pasa sin cambios', () => {
    expect(normalizeAllergens(['gluten', 'lactose'])).toEqual(['gluten', 'lactose'])
  })

  it('objeto booleano convierte a keys con true', () => {
    expect(normalizeAllergens({ gluten: true, lactose: false, nuts: true })).toEqual([
      'gluten',
      'nuts',
    ])
  })

  it('ignora propiedades heredadas enumerables', () => {
    const proto = { inherited_allergen: true }
    const raw = Object.create(proto) as Record<string, unknown>
    raw.gluten = true

    expect(normalizeAllergens(raw)).toEqual(['gluten'])
  })

  it('null/undefined/string → []', () => {
    expect(normalizeAllergens(null)).toEqual([])
    expect(normalizeAllergens(undefined)).toEqual([])
    expect(normalizeAllergens('gluten')).toEqual([])
  })
})

describe('convertUnit', () => {
  const g = { unit_type: 'weight' as const, conversion_factor: 1 }
  const kg = { unit_type: 'weight' as const, conversion_factor: 1000 }
  const ml = { unit_type: 'volume' as const, conversion_factor: 1 }

  it('g → kg usa factores relativos', () => {
    expect(convertUnit(1000, g, kg)).toBe(1)
    expect(convertUnit(500, g, kg)).toBe(0.5)
  })

  it('kg → g inverso', () => {
    expect(convertUnit(1, kg, g)).toBe(1000)
  })

  it('cross-type devuelve null', () => {
    expect(convertUnit(1, g, ml)).toBeNull()
  })

  it('factor 0 devuelve null', () => {
    expect(convertUnit(1, g, { unit_type: 'weight', conversion_factor: 0 })).toBeNull()
  })
})

describe('dedupeMatchesByProduct', () => {
  it('mantiene el match de mayor similarity por producto', () => {
    const matches: ProductMatch[] = [
      { product_id: 'p1', product_name: 'A', matched_text: 'a1', similarity: 0.5, match_kind: 'alias', source_type: null },
      { product_id: 'p1', product_name: 'A', matched_text: 'a2', similarity: 0.8, match_kind: 'name', source_type: null },
      { product_id: 'p2', product_name: 'B', matched_text: 'b1', similarity: 0.3, match_kind: 'alias', source_type: null },
    ]
    const result = dedupeMatchesByProduct(matches)
    expect(result).toHaveLength(2)
    expect(result[0]?.product_id).toBe('p1')
    expect(result[0]?.similarity).toBe(0.8)
    expect(result[1]?.product_id).toBe('p2')
  })
})

describe('mappingResultSummary', () => {
  it('solo ok', () => {
    expect(
      mappingResultSummary({ ok_count: 5, failed_count: 0, failed: [] })
    ).toBe('5 mapeados')
  })

  it('1 ok singular', () => {
    expect(
      mappingResultSummary({ ok_count: 1, failed_count: 0, failed: [] })
    ).toBe('1 mapeado')
  })

  it('ok + errores', () => {
    expect(
      mappingResultSummary({ ok_count: 3, failed_count: 2, failed: [] })
    ).toBe('3 mapeados, 2 con error')
  })
})

describe('validateMappingEntries', () => {
  it('separa válidos de duplicados intra-receta', () => {
    const entries = [
      { recipe_id: 'r1', ingredient_name: 'tomate', product_id: 'p1', unit_id: 'u1' },
      { recipe_id: 'r1', ingredient_name: ' TOMATE ', product_id: 'p2', unit_id: 'u2' }, // duplicado normalizado
      { recipe_id: 'r2', ingredient_name: 'tomate', product_id: 'p1', unit_id: 'u1' },
    ]
    const { valid, duplicates } = validateMappingEntries(entries)
    expect(valid).toHaveLength(2)
    expect(duplicates).toHaveLength(1)
  })

  it('skip entries vacíos', () => {
    const entries = [
      { recipe_id: '', ingredient_name: 'x', product_id: null, unit_id: null },
      { recipe_id: 'r1', ingredient_name: '   ', product_id: null, unit_id: null },
    ]
    const { valid } = validateMappingEntries(entries)
    expect(valid).toHaveLength(0)
  })
})

describe('filterProductsClient', () => {
  const products: Product[] = [
    { id: '1', hotel_id: 'h', category_id: null, name: 'Tomate', description: null, sku: 'TOM-1', default_unit_id: null, min_stock: null, max_stock: null, reorder_point: null, allergens: [], storage_type: 'ambient', shelf_life_days: null, is_active: true, created_at: '', updated_at: '' },
    { id: '2', hotel_id: 'h', category_id: null, name: 'Lechuga', description: 'verde', sku: null, default_unit_id: null, min_stock: null, max_stock: null, reorder_point: null, allergens: [], storage_type: 'refrigerated', shelf_life_days: null, is_active: true, created_at: '', updated_at: '' },
  ]

  it('search vacío devuelve todos', () => {
    expect(filterProductsClient(products, '')).toHaveLength(2)
  })

  it('match por name', () => {
    expect(filterProductsClient(products, 'lech')).toHaveLength(1)
  })

  it('match por sku', () => {
    expect(filterProductsClient(products, 'TOM')).toHaveLength(1)
  })

  it('match por description', () => {
    expect(filterProductsClient(products, 'verde')).toHaveLength(1)
  })
})
