import { z } from 'zod'

const UUID_LOOSE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

const uuidString = () => z.string().regex(UUID_LOOSE, 'Invalid UUID')

export const INVENTORY_MOVEMENT_KINDS = [
  'receive',
  'consume',
  'waste',
  'adjust_in',
  'adjust_out',
  'transfer_in',
  'transfer_out',
] as const

export type InventoryMovementKind = (typeof INVENTORY_MOVEMENT_KINDS)[number]

export const INVENTORY_MOVEMENT_LABELS: Record<InventoryMovementKind, string> = {
  receive: 'Entrada',
  consume: 'Consumo',
  waste: 'Merma',
  adjust_in: 'Ajuste +',
  adjust_out: 'Ajuste -',
  transfer_in: 'Transfer in',
  transfer_out: 'Transfer out',
}

export const INVENTORY_MOVEMENT_VARIANT = {
  receive: 'success',
  consume: 'neutral',
  waste: 'warning',
  adjust_in: 'info',
  adjust_out: 'warning',
  transfer_in: 'neutral',
  transfer_out: 'neutral',
} as const satisfies Record<
  InventoryMovementKind,
  'neutral' | 'warning' | 'success' | 'info'
>

const jsonObjectSchema = z.record(z.string(), z.unknown())

export const inventoryMovementSchema = z.object({
  id: uuidString(),
  hotel_id: uuidString(),
  product_id: uuidString(),
  lot_id: uuidString().nullable(),
  kind: z.enum(INVENTORY_MOVEMENT_KINDS),
  quantity: z.number().positive(),
  unit_id: uuidString(),
  unit_cost: z.number().min(0),
  total_cost: z.number().min(0).nullable(),
  origin: jsonObjectSchema,
  goods_receipt_line_id: uuidString().nullable(),
  recipe_id: uuidString().nullable(),
  notes: z.string().nullable(),
  created_by: uuidString().nullable(),
  created_at: z.string().min(1),
})

export type InventoryMovement = z.infer<typeof inventoryMovementSchema>

export interface InventoryMovementDetail extends InventoryMovement {
  unit_name: string | null
  unit_abbreviation: string | null
}

export const consumedLotSchema = z.object({
  lot_id: z.string().min(1),
  quantity: z.number().positive(),
  unit_cost: z.number().min(0),
  total_cost: z.number().min(0),
})

export type ConsumedLot = z.infer<typeof consumedLotSchema>

export const inventoryConsumptionResultSchema = z.object({
  product_id: uuidString(),
  quantity: z.number().positive(),
  consumed_lots: z.array(consumedLotSchema),
  total_cost: z.number().min(0),
  weighted_unit_cost: z.number().min(0),
  lot_id: z.string().min(1).optional(),
  quantity_delta: z.number().optional(),
  movement_kind: z.enum(INVENTORY_MOVEMENT_KINDS).optional(),
})

export type InventoryConsumptionResult = z.infer<
  typeof inventoryConsumptionResultSchema
>

export const inventoryAdjustmentResultSchema = z.object({
  product_id: uuidString(),
  lot_id: z.string().min(1).optional(),
  quantity: z.number().positive().optional(),
  quantity_delta: z.number(),
  movement_kind: z.enum(INVENTORY_MOVEMENT_KINDS),
  consumed_lots: z.array(consumedLotSchema).optional(),
  total_cost: z.number().min(0),
  weighted_unit_cost: z.number().min(0),
})

export type InventoryAdjustmentResult = z.infer<
  typeof inventoryAdjustmentResultSchema
>

export interface ConsumeInventoryInput {
  hotel_id: string
  product_id: string
  quantity: number
  origin: Record<string, unknown>
}

export interface RegisterWasteInput {
  hotel_id: string
  product_id: string
  quantity: number
  reason: string
}

export interface RegisterAdjustmentInput {
  hotel_id: string
  product_id: string
  quantity_delta: number
  reason: string
}

export function calculateWeightedUnitCost<
  T extends Pick<ConsumedLot, 'quantity' | 'total_cost'>,
>(consumedLots: ReadonlyArray<T>): number {
  const quantity = consumedLots.reduce((sum, lot) => sum + lot.quantity, 0)
  if (quantity <= 0) return 0

  const totalCost = consumedLots.reduce((sum, lot) => sum + lot.total_cost, 0)
  return Number((totalCost / quantity).toFixed(4))
}
