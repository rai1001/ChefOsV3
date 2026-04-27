import { describe, expect, it } from 'vitest'
import {
  PRODUCTION_STATUSES,
  canCancelProductionOrder,
  canCompleteProductionOrder,
  canStartProductionOrder,
  productionOrderSchema,
  productionOrderSummarySchema,
  sumProductionEstimatedCost,
} from './order'

const baseOrder = {
  id: '11111111-1111-4111-8111-111111111111',
  hotel_id: '22222222-2222-4222-8222-222222222222',
  recipe_id: '33333333-3333-4333-8333-333333333333',
  recipe_name: 'Crema de calabaza',
  servings: 80,
  status: 'draft',
  scheduled_at: '2026-04-28T08:00:00.000Z',
  started_at: null,
  completed_at: null,
  cancelled_at: null,
  cancellation_reason: null,
  estimated_total_cost: 120.5,
  actual_total_cost: 0,
  notes: null,
  created_by: '44444444-4444-4444-8444-444444444444',
  created_at: '2026-04-27T10:00:00.000Z',
  updated_at: '2026-04-27T10:00:00.000Z',
}

describe('productionOrderSchema', () => {
  it('valida una orden draft con receta y raciones objetivo', () => {
    expect(productionOrderSchema.parse(baseOrder)).toEqual(baseOrder)
  })

  it('rechaza raciones no positivas', () => {
    const result = productionOrderSchema.safeParse({ ...baseOrder, servings: 0 })
    expect(result.success).toBe(false)
  })
})

describe('productionOrderSummarySchema', () => {
  it('acepta la fila resumida que devuelve v3_list_production_orders', () => {
    const parsed = productionOrderSummarySchema.parse(baseOrder)
    expect(parsed.recipe_name).toBe('Crema de calabaza')
  })
})

describe('production status helpers', () => {
  it('mantiene el orden oficial de estados', () => {
    expect(PRODUCTION_STATUSES).toEqual([
      'draft',
      'scheduled',
      'in_progress',
      'completed',
      'cancelled',
    ])
  })

  it('permite iniciar solo desde draft o scheduled', () => {
    expect(canStartProductionOrder('draft')).toBe(true)
    expect(canStartProductionOrder('scheduled')).toBe(true)
    expect(canStartProductionOrder('in_progress')).toBe(false)
  })

  it('permite completar solo desde in_progress', () => {
    expect(canCompleteProductionOrder('in_progress')).toBe(true)
    expect(canCompleteProductionOrder('draft')).toBe(false)
  })

  it('permite cancelar cualquier estado previo a completed', () => {
    expect(canCancelProductionOrder('draft')).toBe(true)
    expect(canCancelProductionOrder('scheduled')).toBe(true)
    expect(canCancelProductionOrder('in_progress')).toBe(true)
    expect(canCancelProductionOrder('completed')).toBe(false)
  })
})

describe('sumProductionEstimatedCost', () => {
  it('suma costes estimados de líneas snapshot', () => {
    expect(
      sumProductionEstimatedCost([
        { estimated_total_cost: 10.1234 },
        { estimated_total_cost: 4.8766 },
      ])
    ).toBe(15)
  })
})
