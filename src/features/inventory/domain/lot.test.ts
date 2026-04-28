import { describe, expect, it } from 'vitest'
import {
  inventoryLotSchema,
  sortLotsFifo,
  validateLotConsistency,
  type InventoryLot,
} from './lot'

const baseLot: InventoryLot = {
  id: '11111111-1111-1111-1111-111111111111',
  hotel_id: '22222222-2222-2222-2222-222222222222',
  warehouse_id: '99999999-9999-4999-8999-999999999999',
  product_id: '33333333-3333-3333-3333-333333333333',
  goods_receipt_line_id: '44444444-4444-4444-4444-444444444444',
  quantity_received: 5,
  quantity_remaining: 3,
  unit_id: '55555555-5555-5555-5555-555555555555',
  unit_cost: 10,
  received_at: '2026-04-26T10:00:00.000Z',
  expires_at: null,
  notes: null,
  created_at: '2026-04-26T10:00:00.000Z',
  updated_at: '2026-04-26T10:00:00.000Z',
}

describe('inventoryLotSchema', () => {
  it('acepta un lote FIFO consistente', () => {
    expect(inventoryLotSchema.parse(baseLot)).toEqual(baseLot)
  })

  it('rechaza quantity_remaining mayor que quantity_received', () => {
    expect(() =>
      inventoryLotSchema.parse({
        ...baseLot,
        quantity_remaining: 6,
      })
    ).toThrow(/quantity_remaining/)
  })
})

describe('sortLotsFifo', () => {
  it('ordena por received_at asc y usa id como desempate', () => {
    const lotA = {
      ...baseLot,
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      received_at: '2026-04-26T10:00:00.000Z',
    }
    const lotB = {
      ...baseLot,
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      received_at: '2026-04-26T10:00:00.000Z',
    }
    const lotC = {
      ...baseLot,
      id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      received_at: '2026-04-27T10:00:00.000Z',
    }

    expect(sortLotsFifo([lotC, lotA, lotB]).map((lot) => lot.id)).toEqual([
      lotB.id,
      lotA.id,
      lotC.id,
    ])
  })
})

describe('validateLotConsistency', () => {
  it('detecta cantidades negativas o remanente superior al recibido', () => {
    expect(validateLotConsistency(baseLot)).toBe(true)
    expect(validateLotConsistency({ ...baseLot, quantity_remaining: -1 })).toBe(false)
    expect(validateLotConsistency({ ...baseLot, quantity_remaining: 6 })).toBe(false)
  })
})
