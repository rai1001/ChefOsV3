import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import { WarehouseNotFoundError } from '../domain/errors'
import { warehouseSchema } from '../domain/schemas'
import type { Warehouse, WarehouseFilter } from '../domain/types'

export async function fetchWarehouses(
  supabase: SupabaseClient,
  filter: WarehouseFilter
): Promise<Warehouse[]> {
  let query = supabase
    .from('v3_warehouses')
    .select('*')
    .eq('hotel_id', filter.hotelId)
    .order('is_default', { ascending: false })
    .order('name', { ascending: true })

  if (filter.activeOnly !== false) {
    query = query.eq('is_active', true)
  }

  if (filter.search?.trim()) {
    query = query.ilike('name', `%${filter.search.trim()}%`)
  }

  const { data, error } = await query
  if (error) throw mapSupabaseError(error, { resource: 'warehouse' })
  return warehouseSchema.array().parse(data ?? [])
}

export async function fetchWarehouse(
  supabase: SupabaseClient,
  hotelId: string,
  warehouseId: string
): Promise<Warehouse> {
  const { data, error } = await supabase
    .from('v3_warehouses')
    .select('*')
    .eq('hotel_id', hotelId)
    .eq('id', warehouseId)
    .maybeSingle()

  if (error) throw mapSupabaseError(error, { resource: 'warehouse' })
  if (!data) throw new WarehouseNotFoundError(warehouseId)
  return warehouseSchema.parse(data)
}
