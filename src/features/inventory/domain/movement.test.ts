import { describe, expect, it } from 'vitest'
import {
  INVENTORY_MOVEMENT_KINDS,
  calculateWeightedUnitCost,
  inventoryConsumptionResultSchema,
  inventoryMovementSchema,
} from './movement'

describe('inventoryMovementSchema', () => {
  it('cubre todos los tipos de movimiento append-only', () => {
    expect(INVENTORY_MOVEMENT_KINDS).toEqual([
      'receive',
      'consume',
      'waste',
      'adjust_in',
      'adjust_out',
      'transfer_in',
      'transfer_out',
    ])
  })

  it('valida un movimiento consume con total_cost snapshot', () => {
    const movement = inventoryMovementSchema.parse({
      id: '11111111-1111-1111-1111-111111111111',
      hotel_id: '22222222-2222-2222-2222-222222222222',
      product_id: '33333333-3333-3333-3333-333333333333',
      warehouse_id: '99999999-9999-4999-8999-999999999999',
      lot_id: '44444444-4444-4444-4444-444444444444',
      kind: 'consume',
      quantity: 2,
      unit_id: '55555555-5555-5555-5555-555555555555',
      unit_cost: 10,
      total_cost: 20,
      origin: { source: 'manual' },
      goods_receipt_line_id: null,
      recipe_id: null,
      notes: null,
      created_by: null,
      created_at: '2026-04-26T10:00:00.000Z',
    })

    expect(movement.warehouse_id).toBe('99999999-9999-4999-8999-999999999999')
    expect(movement.total_cost).toBe(20)
  })
})

describe('calculateWeightedUnitCost', () => {
  it('calcula coste ponderado desde consumed_lots', () => {
    expect(
      calculateWeightedUnitCost([
        { lot_id: 'lot-a', quantity: 5, unit_cost: 10, total_cost: 50 },
        { lot_id: 'lot-b', quantity: 2, unit_cost: 12, total_cost: 24 },
      ])
    ).toBe(10.5714)
  })

  it('devuelve 0 si la cantidad total es 0', () => {
    expect(calculateWeightedUnitCost([])).toBe(0)
  })
})

describe('inventoryConsumptionResultSchema', () => {
  it('valida el resultado RPC de consumo FIFO', () => {
    const result = inventoryConsumptionResultSchema.parse({
      product_id: '33333333-3333-3333-3333-333333333333',
      quantity: 7,
      consumed_lots: [
        { lot_id: 'lot-a', quantity: 5, unit_cost: 10, total_cost: 50 },
        { lot_id: 'lot-b', quantity: 2, unit_cost: 12, total_cost: 24 },
      ],
      total_cost: 74,
      weighted_unit_cost: 10.5714,
    })

    expect(result.consumed_lots).toHaveLength(2)
  })
})
