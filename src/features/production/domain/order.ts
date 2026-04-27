import { z } from 'zod'
import { productionOrderLineSchema } from './line'

const UUID_LOOSE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

const uuidString = () => z.string().regex(UUID_LOOSE, 'Invalid UUID')

export const PRODUCTION_STATUSES = [
  'draft',
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
] as const

export type ProductionStatus = (typeof PRODUCTION_STATUSES)[number]

export const PRODUCTION_STATUS_LABELS: Record<ProductionStatus, string> = {
  draft: 'Borrador',
  scheduled: 'Programada',
  in_progress: 'En producción',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

export const PRODUCTION_STATUS_VARIANT = {
  draft: 'neutral',
  scheduled: 'info',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'danger',
} as const satisfies Record<
  ProductionStatus,
  'neutral' | 'info' | 'warning' | 'success' | 'danger'
>

const productionOrderBaseSchema = z.object({
  id: uuidString(),
  hotel_id: uuidString(),
  recipe_id: uuidString(),
  recipe_name: z.string().nullable().optional(),
  servings: z.number().positive(),
  status: z.enum(PRODUCTION_STATUSES),
  scheduled_at: z.string().min(1).nullable(),
  started_at: z.string().min(1).nullable(),
  completed_at: z.string().min(1).nullable(),
  cancelled_at: z.string().min(1).nullable(),
  cancellation_reason: z.string().nullable().optional(),
  estimated_total_cost: z.number().min(0),
  actual_total_cost: z.number().min(0),
  notes: z.string().nullable(),
  created_by: uuidString().nullable(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
})

export const productionOrderSchema = productionOrderBaseSchema
export type ProductionOrder = z.infer<typeof productionOrderSchema>

export const productionOrderSummarySchema = productionOrderBaseSchema.required({
  recipe_name: true,
})

export type ProductionOrderSummary = z.infer<
  typeof productionOrderSummarySchema
>

export const productionMovementSchema = z.object({
  id: uuidString(),
  product_id: uuidString(),
  product_name: z.string().nullable().optional(),
  lot_id: uuidString().nullable(),
  kind: z.string().min(1),
  quantity: z.number().positive(),
  unit_id: uuidString(),
  unit_name: z.string().nullable().optional(),
  unit_abbreviation: z.string().nullable().optional(),
  unit_cost: z.number().min(0),
  total_cost: z.number().min(0).nullable(),
  origin: z.record(z.string(), z.unknown()),
  notes: z.string().nullable(),
  created_by: uuidString().nullable(),
  created_at: z.string().min(1),
})

export type ProductionMovement = z.infer<typeof productionMovementSchema>

export const productionSubrecipeProductionSchema = z.object({
  movement_id: uuidString().optional(),
  production_order_id: uuidString(),
  recipe_id: uuidString().nullable(),
  product_id: uuidString(),
  product_name: z.string().nullable().optional(),
  lot_id: uuidString().nullable(),
  quantity_produced: z.number().positive(),
  unit_id: uuidString(),
  unit_name: z.string().nullable().optional(),
  unit_abbreviation: z.string().nullable().optional(),
  unit_cost: z.number().min(0),
  total_cost: z.number().min(0).nullable(),
  origin: z.record(z.string(), z.unknown()),
  created_at: z.string().min(1).optional(),
})

export type ProductionSubrecipeProduction = z.infer<
  typeof productionSubrecipeProductionSchema
>

export const productionOrderDetailSchema = z.object({
  order: productionOrderSchema.required({ recipe_name: true }),
  lines: z.array(productionOrderLineSchema),
  movements: z.array(productionMovementSchema),
  subrecipe_productions: z.array(productionSubrecipeProductionSchema).default([]),
})

export type ProductionOrderDetail = z.infer<typeof productionOrderDetailSchema>

export const createProductionOrderInputSchema = z.object({
  hotel_id: uuidString(),
  recipe_id: uuidString(),
  servings: z.number().positive(),
  scheduled_at: z.string().min(1).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
})

export type CreateProductionOrderInput = z.infer<
  typeof createProductionOrderInputSchema
>

export const productionOrderIdInputSchema = z.object({
  hotel_id: uuidString(),
  production_order_id: uuidString(),
})

export type ProductionOrderIdInput = z.infer<typeof productionOrderIdInputSchema>

export const completeProductionInputSchema = productionOrderIdInputSchema.extend({
  notes: z.string().max(2000).nullable().optional(),
})

export type CompleteProductionInput = z.infer<typeof completeProductionInputSchema>

export const cancelProductionInputSchema = productionOrderIdInputSchema.extend({
  reason: z.string().min(1).max(2000),
})

export type CancelProductionInput = z.infer<typeof cancelProductionInputSchema>

export interface ProductionListFilter {
  hotelId: string
  status?: ProductionStatus
  from?: string
  to?: string
  limit?: number
  offset?: number
}

export function canStartProductionOrder(status: ProductionStatus): boolean {
  return status === 'draft' || status === 'scheduled'
}

export function canCompleteProductionOrder(status: ProductionStatus): boolean {
  return status === 'in_progress'
}

export function canCancelProductionOrder(status: ProductionStatus): boolean {
  return status !== 'completed' && status !== 'cancelled'
}

export function sumProductionEstimatedCost(
  lines: ReadonlyArray<Pick<{ estimated_total_cost: number }, 'estimated_total_cost'>>
): number {
  const total = lines.reduce((sum, line) => sum + line.estimated_total_cost, 0)
  return Number(total.toFixed(4))
}
