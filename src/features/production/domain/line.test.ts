import { describe, expect, it } from 'vitest'
import {
  productionOrderLineSchema,
  scaleRecipeLineSchema,
  toLineCost,
} from './line'

const baseLine = {
  id: '11111111-1111-4111-8111-111111111111',
  hotel_id: '22222222-2222-4222-8222-222222222222',
  production_order_id: '33333333-3333-4333-8333-333333333333',
  product_id: '44444444-4444-4444-8444-444444444444',
  product_name: 'Calabaza',
  quantity_required: 12.5,
  unit_id: '55555555-5555-4555-8555-555555555555',
  unit_name: 'Kilogramo',
  unit_abbreviation: 'kg',
  estimated_unit_cost: 2.2,
  estimated_total_cost: 27.5,
  actual_consumed_quantity: null,
  actual_total_cost: null,
  weighted_unit_cost: null,
  created_at: '2026-04-27T10:00:00.000Z',
}

describe('scaleRecipeLineSchema', () => {
  it('valida una línea de preview de receta escalada', () => {
    const parsed = scaleRecipeLineSchema.parse({
      product_id: baseLine.product_id,
      quantity_required: 12.5,
      unit_id: baseLine.unit_id,
      estimated_unit_cost: 2.2,
    })

    expect(parsed.quantity_required).toBe(12.5)
  })
})

describe('productionOrderLineSchema', () => {
  it('valida una línea snapshot pendiente de consumo', () => {
    expect(productionOrderLineSchema.parse(baseLine)).toEqual(baseLine)
  })

  it('rechaza cantidades requeridas no positivas', () => {
    const result = productionOrderLineSchema.safeParse({
      ...baseLine,
      quantity_required: -1,
    })

    expect(result.success).toBe(false)
  })
})

describe('toLineCost', () => {
  it('redondea el coste de línea a 4 decimales', () => {
    expect(toLineCost(3, 1.33333)).toBe(4)
  })
})
