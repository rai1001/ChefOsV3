import { describe, expect, it } from 'vitest'
import {
  filterInventorySnapshot,
  inventorySnapshotItemSchema,
  inventorySnapshotTotals,
} from './snapshot'

const rows = [
  {
    product_id: '11111111-1111-1111-1111-111111111111',
    name: 'Manzana',
    category_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    qty_on_hand: 7,
    valor_stock: 74,
    lots_count: 2,
    last_received_at: '2026-04-26T10:00:00.000Z',
    last_unit_cost: 12,
  },
  {
    product_id: '22222222-2222-2222-2222-222222222222',
    name: 'Harina',
    category_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    qty_on_hand: 0,
    valor_stock: 0,
    lots_count: 0,
    last_received_at: null,
    last_unit_cost: null,
  },
]

describe('inventorySnapshotItemSchema', () => {
  it('acepta productos sin stock y fechas nulas', () => {
    expect(inventorySnapshotItemSchema.parse(rows[1])).toEqual(rows[1])
  })
})

describe('filterInventorySnapshot', () => {
  it('filtra por categoría y sólo con stock', () => {
    expect(
      filterInventorySnapshot(rows, {
        categoryId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        onlyWithStock: true,
      }).map((row) => row.name)
    ).toEqual(['Manzana'])
  })
})

describe('inventorySnapshotTotals', () => {
  it('suma unidades, valor y lotes', () => {
    expect(inventorySnapshotTotals(rows)).toEqual({
      products: 2,
      productsWithStock: 1,
      qtyOnHand: 7,
      stockValue: 74,
      lotsCount: 2,
    })
  })
})
