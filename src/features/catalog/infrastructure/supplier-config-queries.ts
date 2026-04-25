import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import type { SupplierConfig } from '../domain/types'
import type { SupplierConfigInput } from '../domain/schemas'

export async function fetchSupplierConfig(
  supabase: SupabaseClient,
  hotelId: string,
  supplierId: string
): Promise<SupplierConfig | null> {
  const { data, error } = await supabase
    .from('v3_supplier_configs')
    .select('*')
    .eq('hotel_id', hotelId)
    .eq('supplier_id', supplierId)
    .maybeSingle()
  if (error) throw mapSupabaseError(error, { resource: 'supplier_config' })
  return data as SupplierConfig | null
}

export async function upsertSupplierConfig(
  supabase: SupabaseClient,
  input: SupplierConfigInput
): Promise<SupplierConfig> {
  const { data, error } = await supabase
    .from('v3_supplier_configs')
    .upsert(
      {
        hotel_id: input.hotel_id,
        supplier_id: input.supplier_id,
        delivery_days: input.delivery_days,
        cutoff_time: input.cutoff_time ?? null,
        lead_time_hours: input.lead_time_hours ?? null,
        min_order_amount: input.min_order_amount ?? null,
        min_order_units: input.min_order_units ?? null,
        reception_window_start: input.reception_window_start ?? null,
        reception_window_end: input.reception_window_end ?? null,
        allows_urgent_delivery: input.allows_urgent_delivery,
      },
      { onConflict: 'hotel_id,supplier_id' }
    )
    .select('*')
    .single()
  if (error) throw mapSupabaseError(error, { resource: 'supplier_config' })
  return data as SupplierConfig
}
