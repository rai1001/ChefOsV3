import { z } from 'zod'

const UUID_LOOSE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

const uuidString = () => z.string().regex(UUID_LOOSE, 'Invalid UUID')

export const inventorySnapshotItemSchema = z.object({
  product_id: uuidString(),
  name: z.string().min(1),
  category_id: uuidString().nullable(),
  qty_on_hand: z.number().min(0),
  valor_stock: z.number().min(0),
  lots_count: z.number().int().min(0),
  last_received_at: z.string().nullable(),
  last_unit_cost: z.number().min(0).nullable(),
})

export type InventorySnapshotItem = z.infer<typeof inventorySnapshotItemSchema>

export interface InventorySnapshotFilter {
  hotelId: string
  categoryId?: string | null
  supplierId?: string | null
  onlyWithStock?: boolean
}

export interface InventorySnapshotTotals {
  products: number
  productsWithStock: number
  qtyOnHand: number
  stockValue: number
  lotsCount: number
}

export function filterInventorySnapshot(
  rows: ReadonlyArray<InventorySnapshotItem>,
  filter: Pick<InventorySnapshotFilter, 'categoryId' | 'onlyWithStock'>
): InventorySnapshotItem[] {
  return rows.filter((row) => {
    if (filter.categoryId && row.category_id !== filter.categoryId) return false
    if (filter.onlyWithStock && row.qty_on_hand <= 0) return false
    return true
  })
}

export function inventorySnapshotTotals(
  rows: ReadonlyArray<InventorySnapshotItem>
): InventorySnapshotTotals {
  return rows.reduce<InventorySnapshotTotals>(
    (totals, row) => ({
      products: totals.products + 1,
      productsWithStock: totals.productsWithStock + (row.qty_on_hand > 0 ? 1 : 0),
      qtyOnHand: totals.qtyOnHand + row.qty_on_hand,
      stockValue: totals.stockValue + row.valor_stock,
      lotsCount: totals.lotsCount + row.lots_count,
    }),
    {
      products: 0,
      productsWithStock: 0,
      qtyOnHand: 0,
      stockValue: 0,
      lotsCount: 0,
    }
  )
}
