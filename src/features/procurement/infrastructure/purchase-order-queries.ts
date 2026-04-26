import type { SupabaseClient } from '@supabase/supabase-js'
import {
  buildPaginatedResult,
  pageRange,
  type PaginatedResult,
  type PaginationParams,
} from '@/lib/pagination'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import type {
  GeneratePurchaseOrderResult,
  PurchaseOrder,
  PurchaseOrderLine,
  PurchaseOrdersFilter,
} from '../domain/types'
import { PurchaseOrderNotFoundError } from '../domain/errors'
import type {
  ConsolidatePurchaseRequestsInput,
  TransitionPurchaseOrderInput,
} from '../domain/schemas'

export async function fetchPurchaseOrders(
  supabase: SupabaseClient,
  filter: PurchaseOrdersFilter,
  pagination?: PaginationParams
): Promise<PaginatedResult<PurchaseOrder>> {
  const { from, to, pageSize } = pageRange(pagination)
  let query = supabase
    .from('v3_purchase_orders')
    .select('*')
    .eq('hotel_id', filter.hotelId)
    .order('order_date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filter.status) {
    const statuses = Array.isArray(filter.status) ? filter.status : [filter.status]
    query = query.in('status', statuses)
  }
  if (filter.supplierId) query = query.eq('supplier_id', filter.supplierId)
  if (filter.fromDate) query = query.gte('order_date', filter.fromDate)
  if (filter.toDate) query = query.lte('order_date', filter.toDate)

  const { data, error } = await query
  if (error) throw mapSupabaseError(error, { resource: 'purchase_order' })
  return buildPaginatedResult((data as PurchaseOrder[]) ?? [], pageSize, from)
}

export async function fetchPurchaseOrder(
  supabase: SupabaseClient,
  hotelId: string,
  orderId: string
): Promise<PurchaseOrder> {
  const { data, error } = await supabase
    .from('v3_purchase_orders')
    .select('*')
    .eq('hotel_id', hotelId)
    .eq('id', orderId)
    .maybeSingle()

  if (error) throw mapSupabaseError(error, { resource: 'purchase_order' })
  if (!data) throw new PurchaseOrderNotFoundError(orderId)
  return data as PurchaseOrder
}

export async function fetchPurchaseOrderLines(
  supabase: SupabaseClient,
  hotelId: string,
  orderId: string
): Promise<PurchaseOrderLine[]> {
  const { data, error } = await supabase
    .from('v3_purchase_order_lines')
    .select('*')
    .eq('hotel_id', hotelId)
    .eq('purchase_order_id', orderId)
    .order('created_at', { ascending: true })

  if (error) throw mapSupabaseError(error, { resource: 'purchase_order_line' })
  return (data as PurchaseOrderLine[]) ?? []
}

export async function generatePurchaseOrder(
  supabase: SupabaseClient,
  input: ConsolidatePurchaseRequestsInput
): Promise<GeneratePurchaseOrderResult> {
  const { data, error } = await supabase.rpc('v3_generate_purchase_order', {
    p_hotel_id: input.hotel_id,
    p_pr_ids: input.request_ids,
  })

  if (error) throw mapSupabaseError(error, { resource: 'purchase_order' })
  return data as GeneratePurchaseOrderResult
}

export async function transitionPurchaseOrder(
  supabase: SupabaseClient,
  input: TransitionPurchaseOrderInput
): Promise<void> {
  const { error } = await supabase.rpc('v3_transition_purchase_order', {
    p_hotel_id: input.hotel_id,
    p_order_id: input.order_id,
    p_new_status: input.status,
    p_reason: input.reason ?? null,
  })

  if (error) throw mapSupabaseError(error, { resource: 'purchase_order' })
}
