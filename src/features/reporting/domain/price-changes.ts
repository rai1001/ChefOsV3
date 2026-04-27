import { z } from 'zod'
import { nullableNumberSchema, uuidString } from './shared'

export const priceChangeReportRowSchema = z.object({
  price_change_id: uuidString(),
  product_id: uuidString(),
  product_name: z.string(),
  supplier_id: uuidString().nullable(),
  supplier_name: z.string().nullable(),
  purchase_order_line_id: uuidString().nullable(),
  old_price: nullableNumberSchema,
  new_price: z.number().nonnegative(),
  delta_pct: nullableNumberSchema,
  source: z.string(),
  detected_at: z.string(),
  created_at: z.string(),
})

export const priceChangesReportSchema = priceChangeReportRowSchema.array()

export type PriceChangeReportRow = z.infer<typeof priceChangeReportRowSchema>

export function priceChangesSummary(rows: PriceChangeReportRow[]): {
  count: number
  avgDeltaPct: number | null
} {
  const deltas = rows
    .map((row) => row.delta_pct)
    .filter((delta): delta is number => typeof delta === 'number')

  return {
    count: rows.length,
    avgDeltaPct:
      deltas.length === 0
        ? null
        : deltas.reduce((sum, delta) => sum + delta, 0) / deltas.length,
  }
}
