import { z } from 'zod'
import { nullableNumberSchema, uuidString } from './shared'

export const wasteReportRowSchema = z.object({
  product_id: uuidString(),
  product_name: z.string(),
  category_id: uuidString().nullable(),
  total_quantity_wasted: z.number().nonnegative(),
  total_cost_wasted: z.number().nonnegative(),
  movements_count: z.number().int().nonnegative(),
  pct_of_consume: nullableNumberSchema,
})

export const wasteReportSchema = wasteReportRowSchema.array()

export type WasteReportRow = z.infer<typeof wasteReportRowSchema>

export function wasteTotals(rows: WasteReportRow[]): {
  quantity: number
  cost: number
  movements: number
} {
  return rows.reduce(
    (acc, row) => ({
      quantity: acc.quantity + row.total_quantity_wasted,
      cost: acc.cost + row.total_cost_wasted,
      movements: acc.movements + row.movements_count,
    }),
    { quantity: 0, cost: 0, movements: 0 }
  )
}
