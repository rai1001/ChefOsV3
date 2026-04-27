import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import {
  ProductionInsufficientStockError,
  ProductionInvalidStateError,
  ProductionOrderNotFoundError,
} from '../domain/errors'
import {
  productionFeasibilitySchema,
  productionDeficitSchema,
  type ProductionFeasibility,
  type ProductionDeficit,
} from '../domain/feasibility'
import { scaleRecipeLineSchema, type ScaleRecipeLine } from '../domain/line'
import {
  type CancelProductionInput,
  type CompleteProductionInput,
  type CreateProductionOrderInput,
  type ProductionListFilter,
  type ProductionOrderDetail,
  type ProductionOrderIdInput,
  type ProductionOrderSummary,
  productionOrderDetailSchema,
  productionOrderIdInputSchema,
  productionOrderSummarySchema,
} from '../domain/order'

interface SupabaseErrorLike {
  code?: string
  message?: string
  details?: string | null
}

const createProductionOrderResultSchema = productionOrderDetailSchema
  .pick({ lines: true })
  .extend({
    order_id: productionOrderIdInputSchema.shape.production_order_id,
    total_estimated_cost: productionOrderSummarySchema.shape.estimated_total_cost,
  })

function isErrorLike(error: unknown): error is SupabaseErrorLike {
  return error !== null && typeof error === 'object'
}

function parseDeficits(details: string | null | undefined): ProductionDeficit[] {
  if (!details) return []
  try {
    const raw = JSON.parse(details) as unknown
    return productionDeficitSchema.array().parse(raw)
  } catch {
    return []
  }
}

function mapProductionRpcError(
  error: unknown,
  fallbackOrderId?: string,
  transitionTo?: string
): never {
  if (isErrorLike(error)) {
    if (error.code === 'P0002') {
      throw new ProductionInsufficientStockError(
        parseDeficits(error.details),
        error.message
      )
    }

    const lowerMessage = error.message?.toLowerCase() ?? ''
    if (lowerMessage.includes('production order not found')) {
      throw new ProductionOrderNotFoundError(fallbackOrderId ?? '', error.message)
    }

    if (
      error.code === 'P0003' &&
      lowerMessage.includes('production order cannot')
    ) {
      throw new ProductionInvalidStateError('unknown', transitionTo ?? 'unknown', error.message)
    }
  }

  throw mapSupabaseError(error, { resource: 'production_order' })
}

export async function scaleProductionRecipe(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string,
  targetServings: number
): Promise<ScaleRecipeLine[]> {
  const { data, error } = await supabase.rpc('v3_scale_recipe', {
    p_hotel_id: hotelId,
    p_recipe_id: recipeId,
    p_target_servings: targetServings,
  })

  if (error) throw mapSupabaseError(error, { resource: 'production_recipe_scale' })
  return scaleRecipeLineSchema.array().parse(data ?? [])
}

export async function createProductionOrder(
  supabase: SupabaseClient,
  input: CreateProductionOrderInput
): Promise<{
  order_id: string
  lines: ProductionOrderDetail['lines']
  total_estimated_cost: number
}> {
  const { data, error } = await supabase.rpc('v3_create_production_order', {
    p_hotel_id: input.hotel_id,
    p_recipe_id: input.recipe_id,
    p_servings: input.servings,
    p_scheduled_at: input.scheduled_at ?? null,
    p_notes: input.notes ?? null,
  })

  if (error) mapProductionRpcError(error)
  return createProductionOrderResultSchema.parse(data)
}

export async function checkProductionFeasibility(
  supabase: SupabaseClient,
  input: ProductionOrderIdInput
): Promise<ProductionFeasibility> {
  const { data, error } = await supabase.rpc('v3_check_production_feasibility', {
    p_hotel_id: input.hotel_id,
    p_production_order_id: input.production_order_id,
  })

  if (error) mapProductionRpcError(error, input.production_order_id)
  return productionFeasibilitySchema.parse(data)
}

export async function startProduction(
  supabase: SupabaseClient,
  input: ProductionOrderIdInput
): Promise<ProductionOrderDetail> {
  const { data, error } = await supabase.rpc('v3_start_production', {
    p_hotel_id: input.hotel_id,
    p_production_order_id: input.production_order_id,
  })

  if (error) mapProductionRpcError(error, input.production_order_id, 'in_progress')
  return productionOrderDetailSchema.parse(data)
}

export async function completeProduction(
  supabase: SupabaseClient,
  input: CompleteProductionInput
): Promise<ProductionOrderDetail> {
  const { data, error } = await supabase.rpc('v3_complete_production', {
    p_hotel_id: input.hotel_id,
    p_production_order_id: input.production_order_id,
    p_notes: input.notes ?? null,
  })

  if (error) mapProductionRpcError(error, input.production_order_id, 'completed')
  return productionOrderDetailSchema.parse(data)
}

export async function cancelProduction(
  supabase: SupabaseClient,
  input: CancelProductionInput
): Promise<ProductionOrderDetail> {
  const { data, error } = await supabase.rpc('v3_cancel_production', {
    p_hotel_id: input.hotel_id,
    p_production_order_id: input.production_order_id,
    p_reason: input.reason,
  })

  if (error) mapProductionRpcError(error, input.production_order_id, 'cancelled')
  return productionOrderDetailSchema.parse(data)
}

export async function fetchProductionOrders(
  supabase: SupabaseClient,
  filter: ProductionListFilter
): Promise<ProductionOrderSummary[]> {
  const { data, error } = await supabase.rpc('v3_list_production_orders', {
    p_hotel_id: filter.hotelId,
    p_status: filter.status ?? null,
    p_from: filter.from ?? null,
    p_to: filter.to ?? null,
    p_limit: filter.limit ?? 50,
    p_offset: filter.offset ?? 0,
  })

  if (error) throw mapSupabaseError(error, { resource: 'production_order' })
  return productionOrderSummarySchema.array().parse(data ?? [])
}

export async function fetchProductionOrderDetail(
  supabase: SupabaseClient,
  hotelId: string,
  orderId: string
): Promise<ProductionOrderDetail> {
  const { data, error } = await supabase.rpc('v3_get_production_order', {
    p_hotel_id: hotelId,
    p_id: orderId,
  })

  if (error) mapProductionRpcError(error, orderId)
  return productionOrderDetailSchema.parse(data)
}
