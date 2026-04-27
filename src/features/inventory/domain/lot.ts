import { z } from 'zod'

const UUID_LOOSE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

const uuidString = () => z.string().regex(UUID_LOOSE, 'Invalid UUID')

export const inventoryLotSchema = z
  .object({
    id: uuidString(),
    hotel_id: uuidString(),
    product_id: uuidString(),
    goods_receipt_line_id: uuidString().nullable(),
    quantity_received: z.number().positive(),
    quantity_remaining: z.number().min(0),
    unit_id: uuidString(),
    unit_cost: z.number().min(0),
    received_at: z.string().min(1),
    expires_at: z.string().nullable(),
    notes: z.string().nullable(),
    created_at: z.string().min(1),
    updated_at: z.string().min(1),
  })
  .refine((lot) => lot.quantity_remaining <= lot.quantity_received, {
    message: 'quantity_remaining must be <= quantity_received',
    path: ['quantity_remaining'],
  })

export type InventoryLot = z.infer<typeof inventoryLotSchema>

export interface InventoryLotDetail extends InventoryLot {
  product_name: string | null
  product_sku: string | null
  unit_name: string | null
  unit_abbreviation: string | null
  goods_receipt_id: string | null
  lot_number: string | null
}

export function validateLotConsistency(
  lot: Pick<InventoryLot, 'quantity_received' | 'quantity_remaining' | 'unit_cost'>
): boolean {
  return (
    lot.quantity_received > 0 &&
    lot.quantity_remaining >= 0 &&
    lot.quantity_remaining <= lot.quantity_received &&
    lot.unit_cost >= 0
  )
}

export function sortLotsFifo<T extends Pick<InventoryLot, 'id' | 'received_at'>>(
  lots: ReadonlyArray<T>
): T[] {
  return [...lots].sort((a, b) => {
    const byDate = a.received_at.localeCompare(b.received_at)
    return byDate !== 0 ? byDate : a.id.localeCompare(b.id)
  })
}
