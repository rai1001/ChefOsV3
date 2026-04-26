import type { SupabaseClient } from '@supabase/supabase-js'
import {
  buildPaginatedResult,
  pageRange,
  type PaginatedResult,
  type PaginationParams,
} from '@/lib/pagination'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import type {
  PurchaseRequest,
  PurchaseRequestLine,
  PurchaseRequestsFilter,
} from '../domain/types'
import { PurchaseRequestNotFoundError } from '../domain/errors'
import type {
  CreatePurchaseRequestInput,
  TransitionPurchaseRequestInput,
} from '../domain/schemas'

export async function fetchPurchaseRequests(
  supabase: SupabaseClient,
  filter: PurchaseRequestsFilter,
  pagination?: PaginationParams
): Promise<PaginatedResult<PurchaseRequest>> {
  const { from, to, pageSize } = pageRange(pagination)
  let query = supabase
    .from('v3_purchase_requests')
    .select('*')
    .eq('hotel_id', filter.hotelId)
    .order('needed_date', { ascending: true })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filter.status) {
    const statuses = Array.isArray(filter.status) ? filter.status : [filter.status]
    query = query.in('status', statuses)
  }
  if (filter.origin) query = query.eq('origin', filter.origin)
  if (filter.eventId) query = query.eq('event_id', filter.eventId)
  if (filter.fromDate) query = query.gte('needed_date', filter.fromDate)
  if (filter.toDate) query = query.lte('needed_date', filter.toDate)

  const { data, error } = await query
  if (error) throw mapSupabaseError(error, { resource: 'purchase_request' })
  return buildPaginatedResult((data as PurchaseRequest[]) ?? [], pageSize, from)
}

export async function fetchPurchaseRequest(
  supabase: SupabaseClient,
  hotelId: string,
  requestId: string
): Promise<PurchaseRequest> {
  const { data, error } = await supabase
    .from('v3_purchase_requests')
    .select('*')
    .eq('hotel_id', hotelId)
    .eq('id', requestId)
    .maybeSingle()

  if (error) throw mapSupabaseError(error, { resource: 'purchase_request' })
  if (!data) throw new PurchaseRequestNotFoundError(requestId)
  return data as PurchaseRequest
}

export async function fetchPurchaseRequestLines(
  supabase: SupabaseClient,
  hotelId: string,
  requestId: string
): Promise<PurchaseRequestLine[]> {
  const { data, error } = await supabase
    .from('v3_purchase_request_lines')
    .select('*')
    .eq('hotel_id', hotelId)
    .eq('purchase_request_id', requestId)
    .order('created_at', { ascending: true })

  if (error) throw mapSupabaseError(error, { resource: 'purchase_request_line' })
  return (data as PurchaseRequestLine[]) ?? []
}

export async function createPurchaseRequest(
  supabase: SupabaseClient,
  input: CreatePurchaseRequestInput
): Promise<string> {
  const { data, error } = await supabase.rpc('v3_create_purchase_request', {
    p_hotel_id: input.hotel_id,
    p_origin: input.origin,
    p_needed_date: input.needed_date,
    p_event_id: input.event_id ?? null,
    p_notes: input.notes ?? null,
    p_lines: input.lines,
  })

  if (error) throw mapSupabaseError(error, { resource: 'purchase_request' })
  return data as string
}

export async function transitionPurchaseRequest(
  supabase: SupabaseClient,
  input: TransitionPurchaseRequestInput
): Promise<void> {
  const { error } = await supabase.rpc('v3_transition_purchase_request', {
    p_hotel_id: input.hotel_id,
    p_request_id: input.request_id,
    p_new_status: input.status,
    p_reason: input.reason ?? null,
  })

  if (error) throw mapSupabaseError(error, { resource: 'purchase_request' })
}
