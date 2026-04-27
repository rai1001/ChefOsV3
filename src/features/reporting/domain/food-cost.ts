import { z } from 'zod'
import { nullableNumberSchema, uuidString } from './shared'

export const foodCostReportRowSchema = z.object({
  recipe_id: uuidString(),
  recipe_name: z.string(),
  production_orders_count: z.number().int().nonnegative(),
  total_servings_produced: z.number().nonnegative(),
  total_estimated_cost: z.number().nonnegative(),
  total_actual_cost: z.number().nonnegative(),
  cost_variance_pct: nullableNumberSchema,
  avg_actual_cost_per_serving: nullableNumberSchema,
})

export const foodCostReportSchema = foodCostReportRowSchema.array()

export type FoodCostReportRow = z.infer<typeof foodCostReportRowSchema>

export function foodCostTotals(rows: FoodCostReportRow[]): {
  orders: number
  servings: number
  estimatedCost: number
  actualCost: number
  variancePct: number | null
} {
  const totals = rows.reduce(
    (acc, row) => ({
      orders: acc.orders + row.production_orders_count,
      servings: acc.servings + row.total_servings_produced,
      estimatedCost: acc.estimatedCost + row.total_estimated_cost,
      actualCost: acc.actualCost + row.total_actual_cost,
    }),
    { orders: 0, servings: 0, estimatedCost: 0, actualCost: 0 }
  )

  return {
    ...totals,
    variancePct:
      totals.estimatedCost === 0
        ? null
        : ((totals.actualCost - totals.estimatedCost) / totals.estimatedCost) * 100,
  }
}
