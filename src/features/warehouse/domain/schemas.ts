import { z } from 'zod'
import { uuidString } from '@/lib/zod/uuid-string'
import { WAREHOUSE_TYPES } from './types'

const emptyStringToNull = (value: string | null | undefined) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export const warehouseSchema = z.object({
  id: uuidString(),
  hotel_id: uuidString(),
  name: z.string().min(1),
  warehouse_type: z.enum(WAREHOUSE_TYPES),
  is_default: z.boolean(),
  is_active: z.boolean(),
  notes: z.string().nullable(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
})

export const warehouseStockItemSchema = z.object({
  warehouse_id: uuidString(),
  warehouse_name: z.string().min(1),
  product_id: uuidString(),
  product_name: z.string().min(1),
  unit_id: uuidString(),
  unit_abbreviation: z.string().min(1),
  quantity_remaining: z.number().min(0),
  unit_cost_avg: z.number().min(0),
})

export const createWarehouseSchema = z.object({
  hotel_id: uuidString(),
  name: z.string().trim().min(2).max(120),
  warehouse_type: z.enum(WAREHOUSE_TYPES),
  notes: z.string().max(2000).optional().nullable().transform(emptyStringToNull),
})

export const updateWarehouseSchema = z.object({
  hotel_id: uuidString(),
  warehouse_id: uuidString(),
  name: z.string().trim().min(2).max(120).optional(),
  warehouse_type: z.enum(WAREHOUSE_TYPES).optional(),
  is_active: z.boolean().optional(),
  notes: z.string().max(2000).optional().nullable().transform(emptyStringToNull),
})

export const warehouseIdInputSchema = z.object({
  hotel_id: uuidString(),
  warehouse_id: uuidString(),
})

export const transferLotSchema = z.object({
  hotel_id: uuidString(),
  lot_id: uuidString(),
  to_warehouse_id: uuidString(),
  quantity: z.coerce.number().positive(),
  notes: z.string().max(1000).optional().nullable().transform(emptyStringToNull),
})

export const stockByWarehouseInputSchema = z.object({
  hotel_id: uuidString(),
  product_id: uuidString().optional().nullable(),
})

export const transferLotResultSchema = z.object({
  from_movement_id: uuidString(),
  to_movement_id: uuidString(),
  new_lot_id: uuidString().nullable().optional(),
})

export type WarehouseInput = z.input<typeof createWarehouseSchema>
export type UpdateWarehouseInput = z.input<typeof updateWarehouseSchema>
export type WarehouseIdInput = z.input<typeof warehouseIdInputSchema>
export type TransferLotInput = z.input<typeof transferLotSchema>
export type StockByWarehouseInput = z.input<typeof stockByWarehouseInputSchema>
export type TransferLotResult = z.infer<typeof transferLotResultSchema>
