import { describe, expect, it } from 'vitest'
import {
  aliasInputSchema,
  mappingPayloadSchema,
  productInputSchema,
  productsFilterSchema,
} from './schemas'

const UUID = '00000000-0000-0000-0000-000000000000'

describe('productInputSchema', () => {
  it('acepta payload mínimo válido', () => {
    const res = productInputSchema.safeParse({
      hotel_id: UUID,
      name: 'Tomate',
    })
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.storage_type).toBe('ambient') // default
      expect(res.data.is_active).toBe(true) // default
      expect(res.data.allergens).toEqual([])
    }
  })

  it('rechaza nombre vacío', () => {
    const res = productInputSchema.safeParse({ hotel_id: UUID, name: '   ' })
    expect(res.success).toBe(false)
  })

  it('rechaza storage_type inválido', () => {
    const res = productInputSchema.safeParse({
      hotel_id: UUID,
      name: 'X',
      storage_type: 'invalid',
    })
    expect(res.success).toBe(false)
  })

  it('rechaza shelf_life_days negativo', () => {
    const res = productInputSchema.safeParse({
      hotel_id: UUID,
      name: 'X',
      shelf_life_days: -5,
    })
    expect(res.success).toBe(false)
  })

  it('rechaza min_stock negativo', () => {
    const res = productInputSchema.safeParse({
      hotel_id: UUID,
      name: 'X',
      min_stock: -1,
    })
    expect(res.success).toBe(false)
  })
})

describe('aliasInputSchema', () => {
  it('acepta alias válido', () => {
    const res = aliasInputSchema.safeParse({
      hotel_id: UUID,
      product_id: UUID,
      alias_name: 'tomate rama',
    })
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.source_type).toBe('manual') // default
      expect(res.data.confidence_score).toBe(1.0)
    }
  })

  it('rechaza alias vacío', () => {
    const res = aliasInputSchema.safeParse({
      hotel_id: UUID,
      product_id: UUID,
      alias_name: '',
    })
    expect(res.success).toBe(false)
  })

  it('rechaza confidence_score fuera de rango', () => {
    const res = aliasInputSchema.safeParse({
      hotel_id: UUID,
      product_id: UUID,
      alias_name: 'x',
      confidence_score: 1.5,
    })
    expect(res.success).toBe(false)
  })
})

describe('mappingPayloadSchema', () => {
  it('acepta mappings válidos', () => {
    const res = mappingPayloadSchema.safeParse({
      mappings: [
        {
          recipe_id: UUID,
          ingredient_name: 'tomate',
          product_id: UUID,
          unit_id: UUID,
        },
      ],
    })
    expect(res.success).toBe(true)
  })

  it('acepta product_id y unit_id null', () => {
    const res = mappingPayloadSchema.safeParse({
      mappings: [
        {
          recipe_id: UUID,
          ingredient_name: 'x',
          product_id: null,
          unit_id: null,
        },
      ],
    })
    expect(res.success).toBe(true)
  })

  it('rechaza mappings vacío', () => {
    const res = mappingPayloadSchema.safeParse({ mappings: [] })
    expect(res.success).toBe(false)
  })

  it('rechaza mappings > 500', () => {
    const big = Array.from({ length: 501 }, () => ({
      recipe_id: UUID,
      ingredient_name: 'x',
      product_id: null,
      unit_id: null,
    }))
    const res = mappingPayloadSchema.safeParse({ mappings: big })
    expect(res.success).toBe(false)
  })

  it('rechaza ingredient_name vacío', () => {
    const res = mappingPayloadSchema.safeParse({
      mappings: [
        {
          recipe_id: UUID,
          ingredient_name: '',
          product_id: null,
          unit_id: null,
        },
      ],
    })
    expect(res.success).toBe(false)
  })
})

describe('productsFilterSchema', () => {
  it('activeOnly default true', () => {
    const res = productsFilterSchema.safeParse({ hotelId: UUID })
    expect(res.success).toBe(true)
    if (res.success) expect(res.data.activeOnly).toBe(true)
  })

  it('permite categoryId null explícito', () => {
    const res = productsFilterSchema.safeParse({ hotelId: UUID, categoryId: null })
    expect(res.success).toBe(true)
  })
})
