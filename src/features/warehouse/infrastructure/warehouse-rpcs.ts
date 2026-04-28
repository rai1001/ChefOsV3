import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import { uuidString } from '@/lib/zod/uuid-string'
import {
  DefaultWarehouseRequiredError,
  TransferQuantityExceededError,
  WarehouseHasActiveStockError,
  WarehouseNotFoundError,
} from '../domain/errors'
import {
  createWarehouseSchema,
  stockByWarehouseInputSchema,
  transferLotResultSchema,
  transferLotSchema,
  updateWarehouseSchema,
  warehouseIdInputSchema,
  warehouseStockItemSchema,
  type StockByWarehouseInput,
  type TransferLotInput,
  type TransferLotResult,
  type UpdateWarehouseInput,
  type WarehouseIdInput,
  type WarehouseInput,
} from '../domain/schemas'
import type { WarehouseStockItem } from '../domain/types'

interface SupabaseErrorLike {
  code?: string
  message?: string
}

const warehouseMutationResultSchema = z
  .object({
    id: uuidString().optional(),
    warehouse_id: uuidString().optional(),
  })
  .passthrough()

export interface WarehouseMutationResult extends Record<string, unknown> {
  warehouse_id: string
}

function parseWarehouseMutationResult(data: unknown): WarehouseMutationResult {
  const parsed = warehouseMutationResultSchema.parse(data)
  const warehouseId = parsed.warehouse_id ?? parsed.id
  if (!warehouseId) {
    throw new WarehouseNotFoundError('', 'La RPC no devolvió warehouse_id')
  }
  return { ...parsed, warehouse_id: warehouseId }
}

function isErrorLike(error: unknown): error is SupabaseErrorLike {
  return error !== null && typeof error === 'object'
}

function mapWarehouseRpcError(error: unknown, warehouseId?: string): never {
  if (isErrorLike(error)) {
    const message = error.message ?? ''
    if (error.code === 'P0011') {
      throw new WarehouseHasActiveStockError(message)
    }
    if (error.code === 'P0002') {
      throw new TransferQuantityExceededError(message)
    }
    if (error.code === 'P0010') {
      throw new WarehouseNotFoundError(warehouseId ?? '', message)
    }
    if (error.code === 'P0018') {
      throw new DefaultWarehouseRequiredError(message)
    }
  }

  throw mapSupabaseError(error, { resource: 'warehouse' })
}

export async function createWarehouse(
  supabase: SupabaseClient,
  input: WarehouseInput
): Promise<WarehouseMutationResult> {
  const parsed = createWarehouseSchema.parse(input)
  const { data, error } = await supabase.rpc('v3_create_warehouse', {
    p_hotel_id: parsed.hotel_id,
    p_name: parsed.name,
    p_warehouse_type: parsed.warehouse_type,
    p_notes: parsed.notes ?? null,
  })

  if (error) mapWarehouseRpcError(error)
  return parseWarehouseMutationResult(data)
}

export async function updateWarehouse(
  supabase: SupabaseClient,
  input: UpdateWarehouseInput
): Promise<WarehouseMutationResult> {
  const parsed = updateWarehouseSchema.parse(input)
  const { hotel_id, warehouse_id, ...payload } = parsed
  const { data, error } = await supabase.rpc('v3_update_warehouse', {
    p_hotel_id: hotel_id,
    p_warehouse_id: warehouse_id,
    p_payload: payload,
  })

  if (error) mapWarehouseRpcError(error, warehouse_id)
  return parseWarehouseMutationResult(data)
}

export async function setDefaultWarehouse(
  supabase: SupabaseClient,
  input: WarehouseIdInput
): Promise<WarehouseMutationResult> {
  const parsed = warehouseIdInputSchema.parse(input)
  const { data, error } = await supabase.rpc('v3_set_default_warehouse', {
    p_hotel_id: parsed.hotel_id,
    p_warehouse_id: parsed.warehouse_id,
  })

  if (error) mapWarehouseRpcError(error, parsed.warehouse_id)
  return parseWarehouseMutationResult(data)
}

export async function archiveWarehouse(
  supabase: SupabaseClient,
  input: WarehouseIdInput
): Promise<WarehouseMutationResult> {
  const parsed = warehouseIdInputSchema.parse(input)
  const { data, error } = await supabase.rpc('v3_archive_warehouse', {
    p_hotel_id: parsed.hotel_id,
    p_warehouse_id: parsed.warehouse_id,
  })

  if (error) mapWarehouseRpcError(error, parsed.warehouse_id)
  return parseWarehouseMutationResult(data)
}

export async function transferLotQuantity(
  supabase: SupabaseClient,
  input: TransferLotInput
): Promise<TransferLotResult> {
  const parsed = transferLotSchema.parse(input)
  const { data, error } = await supabase.rpc('v3_transfer_lot_quantity', {
    p_hotel_id: parsed.hotel_id,
    p_lot_id: parsed.lot_id,
    p_to_warehouse_id: parsed.to_warehouse_id,
    p_quantity: parsed.quantity,
    p_notes: parsed.notes ?? null,
  })

  if (error) mapWarehouseRpcError(error, parsed.to_warehouse_id)
  return transferLotResultSchema.parse(data)
}

export async function getStockByWarehouse(
  supabase: SupabaseClient,
  input: StockByWarehouseInput
): Promise<WarehouseStockItem[]> {
  const parsed = stockByWarehouseInputSchema.parse(input)
  const { data, error } = await supabase.rpc('v3_get_stock_by_warehouse', {
    p_hotel_id: parsed.hotel_id,
    p_product_id: parsed.product_id ?? null,
  })

  if (error) mapWarehouseRpcError(error)
  return warehouseStockItemSchema.array().parse(data ?? [])
}
