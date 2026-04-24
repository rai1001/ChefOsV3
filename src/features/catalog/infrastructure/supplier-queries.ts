import type { SupabaseClient } from '@supabase/supabase-js'
import {
  buildPaginatedResult,
  pageRange,
  type PaginatedResult,
  type PaginationParams,
} from '@/lib/pagination'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import type { Supplier, SuppliersFilter } from '../domain/types'
import { SupplierNotFoundError } from '../domain/errors'
import type { SupplierInput } from '../domain/schemas'

export async function fetchSuppliers(
  supabase: SupabaseClient,
  filter: SuppliersFilter,
  pagination?: PaginationParams
): Promise<PaginatedResult<Supplier>> {
  const { from, to, pageSize } = pageRange(pagination)
  let query = supabase
    .from('suppliers')
    .select('*')
    .eq('hotel_id', filter.hotelId)
    .order('name', { ascending: true })
    .range(from, to)

  if (filter.activeOnly !== false) query = query.eq('is_active', true)
  if (filter.search) query = query.ilike('name', `%${filter.search}%`)

  const { data, error } = await query
  if (error) throw mapSupabaseError(error, { resource: 'supplier' })
  return buildPaginatedResult((data as Supplier[]) ?? [], pageSize, from)
}

export async function fetchSupplier(
  supabase: SupabaseClient,
  hotelId: string,
  supplierId: string
): Promise<Supplier> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', supplierId)
    .eq('hotel_id', hotelId)
    .maybeSingle()
  if (error) throw mapSupabaseError(error, { resource: 'supplier' })
  if (!data) throw new SupplierNotFoundError(supplierId)
  return data as Supplier
}

export async function createSupplier(
  supabase: SupabaseClient,
  input: SupplierInput
): Promise<Supplier> {
  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      hotel_id: input.hotel_id,
      name: input.name.trim(),
      contact_name: input.contact_name ?? null,
      email: input.email && input.email.length > 0 ? input.email : null,
      phone: input.phone ?? null,
      address: input.address ?? null,
      tax_id: input.tax_id ?? null,
      payment_terms: input.payment_terms ?? null,
      delivery_days: input.delivery_days,
      min_order_amount: input.min_order_amount ?? null,
      rating: input.rating,
      notes: input.notes ?? null,
      is_active: input.is_active,
    })
    .select('*')
    .single()
  if (error) throw mapSupabaseError(error, { resource: 'supplier' })
  return data as Supplier
}

export interface UpdateSupplierInput extends Partial<Omit<SupplierInput, 'hotel_id'>> {
  id: string
  hotel_id: string
}

export async function updateSupplier(
  supabase: SupabaseClient,
  input: UpdateSupplierInput
): Promise<Supplier> {
  const { id, hotel_id, ...rest } = input
  const patch: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined) patch[k] = v
  }

  const { data, error } = await supabase
    .from('suppliers')
    .update(patch)
    .eq('id', id)
    .eq('hotel_id', hotel_id)
    .select('*')
    .maybeSingle()
  if (error) throw mapSupabaseError(error, { resource: 'supplier' })
  if (!data) throw new SupplierNotFoundError(id)
  return data as Supplier
}

export async function archiveSupplier(
  supabase: SupabaseClient,
  hotelId: string,
  supplierId: string
): Promise<void> {
  const { error } = await supabase
    .from('suppliers')
    .update({ is_active: false })
    .eq('id', supplierId)
    .eq('hotel_id', hotelId)
  if (error) throw mapSupabaseError(error, { resource: 'supplier' })
}

export async function restoreSupplier(
  supabase: SupabaseClient,
  hotelId: string,
  supplierId: string
): Promise<void> {
  const { error } = await supabase
    .from('suppliers')
    .update({ is_active: true })
    .eq('id', supplierId)
    .eq('hotel_id', hotelId)
  if (error) throw mapSupabaseError(error, { resource: 'supplier' })
}
