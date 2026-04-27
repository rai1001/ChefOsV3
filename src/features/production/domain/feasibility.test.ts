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
    })

    expect(getMissingProductionProducts(parsed)).toEqual([
      '11111111-1111-4111-8111-111111111111',
    ])
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
    })

    expect(result.success).toBe(false)
  })
})
