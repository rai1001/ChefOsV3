import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import { InsufficientStockError } from '../domain/errors'
import {
  inventoryAdjustmentResultSchema,
  inventoryConsumptionResultSchema,
  type ConsumeInventoryInput,
  type InventoryAdjustmentResult,
  type InventoryConsumptionResult,
  type RegisterAdjustmentInput,
  type RegisterWasteInput,
} from '../domain/movement'

interface SupabaseErrorLike {
  code?: string
  message?: string
}

function isInsufficientStock(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const candidate = error as SupabaseErrorLike
  return (
    candidate.code === 'P0002' &&
    typeof candidate.message === 'string' &&
    candidate.message.toLowerCase().includes('insufficient stock')
  )
}

export async function consumeInventory(
  supabase: SupabaseClient,
  input: ConsumeInventoryInput
): Promise<InventoryConsumptionResult> {
  const { data, error } = await supabase.rpc('v3_consume_inventory', {
    p_hotel_id: input.hotel_id,
    p_product_id: input.product_id,
    p_quantity: input.quantity,
    p_origin: input.origin,
  })

  if (error) {
    if (isInsufficientStock(error)) {
      throw new InsufficientStockError(input.product_id, error.message)
    }
    throw mapSupabaseError(error, { resource: 'inventory' })
  }

  return inventoryConsumptionResultSchema.parse(data)
}

export async function registerWaste(
  supabase: SupabaseClient,
  input: RegisterWasteInput
): Promise<InventoryConsumptionResult> {
  const { data, error } = await supabase.rpc('v3_register_waste', {
    p_hotel_id: input.hotel_id,
    p_product_id: input.product_id,
    p_quantity: input.quantity,
    p_reason: input.reason,
  })

  if (error) {
    if (isInsufficientStock(error)) {
      throw new InsufficientStockError(input.product_id, error.message)
    }
    throw mapSupabaseError(error, { resource: 'inventory' })
  }

  return inventoryConsumptionResultSchema.parse(data)
}

export async function registerAdjustment(
  supabase: SupabaseClient,
  input: RegisterAdjustmentInput
): Promise<InventoryAdjustmentResult> {
  const { data, error } = await supabase.rpc('v3_register_adjustment', {
    p_hotel_id: input.hotel_id,
    p_product_id: input.product_id,
    p_quantity_delta: input.quantity_delta,
    p_reason: input.reason,
  })

  if (error) {
    if (isInsufficientStock(error)) {
      throw new InsufficientStockError(input.product_id, error.message)
    }
    throw mapSupabaseError(error, { resource: 'inventory' })
  }

  return inventoryAdjustmentResultSchema.parse(data)
}
