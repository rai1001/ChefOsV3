import { z } from 'zod'
import { nullableStringSchema, uuidString } from './shared'

export const stockHealthSummarySchema = z.object({
  total_products_with_stock: z.number().int().nonnegative(),
  total_qty_on_hand: z.number().nonnegative(),
  total_stock_value: z.number().nonnegative(),
  total_lots_active: z.number().int().nonnegative(),
  total_preparation_lots_active: z.number().int().nonnegative(),
})

export const expiringLotSchema = z.object({
  lot_id: uuidString(),
  product_id: uuidString(),
  product_name: z.string(),
  category_id: uuidString().nullable(),
  quantity_remaining: z.number().nonnegative(),
  unit_id: uuidString(),
  unit_name: z.string(),
  unit_abbreviation: z.string(),
  unit_cost: z.number().nonnegative(),
  stock_value: z.number().nonnegative(),
  received_at: z.string(),
  expires_at: z.string(),
  days_to_expiry: z.number().int(),
  is_preparation: z.boolean(),
  production_order_id: uuidString().nullable(),
})

export const deadStockRowSchema = z.object({
  product_id: uuidString(),
  product_name: z.string(),
  category_id: uuidString().nullable(),
  qty_on_hand: z.number().nonnegative(),
  stock_value: z.number().nonnegative(),
  lots_count: z.number().int().nonnegative(),
  last_consumed_at: nullableStringSchema,
})

export const stockHealthReportSchema = z.object({
  summary: stockHealthSummarySchema,
  expiring_soon: expiringLotSchema.array(),
  dead_stock: deadStockRowSchema.array(),
})

export type StockHealthReport = z.infer<typeof stockHealthReportSchema>
export type ExpiringLot = z.infer<typeof expiringLotSchema>
export type DeadStockRow = z.infer<typeof deadStockRowSchema>
