import { z } from 'zod'

const uuidString = () => z.uuid()

export const scaleRecipeLineSchema = z.object({
  product_id: uuidString(),
  quantity_required: z.number().positive(),
  unit_id: uuidString(),
  estimated_unit_cost: z.number().min(0),
})

export type ScaleRecipeLine = z.infer<typeof scaleRecipeLineSchema>

export const productionOrderLineSchema = z.object({
  id: uuidString(),
  hotel_id: uuidString(),
  production_order_id: uuidString(),
  product_id: uuidString(),
  product_name: z.string().nullable().optional(),
  quantity_required: z.number().positive(),
  unit_id: uuidString(),
  unit_name: z.string().nullable().optional(),
  unit_abbreviation: z.string().nullable().optional(),
  estimated_unit_cost: z.number().min(0),
  estimated_total_cost: z.number().min(0),
  actual_consumed_quantity: z.number().min(0).nullable(),
  actual_total_cost: z.number().min(0).nullable(),
  weighted_unit_cost: z.number().min(0).nullable(),
  created_at: z.string().min(1),
})

export type ProductionOrderLine = z.infer<typeof productionOrderLineSchema>

export function toLineCost(quantity: number, unitCost: number): number {
  return Number((quantity * unitCost).toFixed(4))
}
