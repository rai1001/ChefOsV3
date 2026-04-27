import { describe, expect, it } from 'vitest'
import {
  getMissingProductionProducts,
  productionFeasibilitySchema,
} from './feasibility'

describe('productionFeasibilitySchema', () => {
  it('valida una respuesta feasible sin déficits', () => {
    const parsed = productionFeasibilitySchema.parse({
      feasible: true,
      deficits: [],
      subrecipe_chain: [],
    })

    expect(parsed.feasible).toBe(true)
  })

  it('valida déficits con required, available y missing', () => {
    const parsed = productionFeasibilitySchema.parse({
      feasible: false,
      deficits: [
        {
          product_id: '11111111-1111-4111-8111-111111111111',
          required: 10,
          available: 4,
          missing: 6,
        },
      ],
      subrecipe_chain: [
        {
          depth: 1,
          parent_recipe_id: '22222222-2222-4222-8222-222222222222',
          recipe_id: '33333333-3333-4333-8333-333333333333',
          product_id: '44444444-4444-4444-8444-444444444444',
          unit_id: '55555555-5555-4555-8555-555555555555',
          required: 0.6,
          available: 0,
          missing: 0.6,
          output_quantity_per_batch: 1,
          batches_needed: 1,
          target_servings: 8,
          quantity_to_produce: 1,
          will_produce: true,
        },
      ],
    })

    expect(getMissingProductionProducts(parsed)).toEqual([
      '11111111-1111-4111-8111-111111111111',
    ])
    expect(parsed.subrecipe_chain[0]?.will_produce).toBe(true)
  })

  it('rechaza missing negativo', () => {
    const result = productionFeasibilitySchema.safeParse({
      feasible: false,
      deficits: [
        {
          product_id: '11111111-1111-4111-8111-111111111111',
          required: 10,
          available: 12,
          missing: -2,
        },
      ],
      subrecipe_chain: [],
    })

    expect(result.success).toBe(false)
  })
})
