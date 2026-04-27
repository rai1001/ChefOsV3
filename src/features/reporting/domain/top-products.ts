import { z } from 'zod'
import { uuidString } from './shared'

export const topProductReportRowSchema = z.object({
  product_id: uuidString(),
  product_name: z.string(),
  category_id: uuidString().nullable(),
  metric_value: z.number().nonnegative(),
  metric_secondary: z.number().nonnegative(),
  rank: z.number().int().positive(),
})

export const topProductsReportSchema = topProductReportRowSchema.array()

export type TopProductReportRow = z.infer<typeof topProductReportRowSchema>
