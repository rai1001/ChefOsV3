import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import type { ProductSupplierRef } from '../domain/types'

export async function fetchProductSupplierRefs(
  supabase: SupabaseClient,
  hotelId: string,
  productId: string
): Promise<ProductSupplierRef[]> {
  const { data, error } = await supabase
    .from('product_supplier_refs')
    .select('*')
    .eq('hotel_id', hotelId)
    .eq('product_id', productId)
  if (error) throw mapSupabaseError(error, { resource: 'product_supplier_ref' })
  return (data as ProductSupplierRef[]) ?? []
}

export async function fetchRefsBySupplier(
  supabase: SupabaseClient,
  hotelId: string,
  supplierId: string
): Promise<ProductSupplierRef[]> {
  const { data, error } = await supabase
    .from('product_supplier_refs')
    .select('*')
    .eq('hotel_id', hotelId)
    .eq('supplier_id', supplierId)
  if (error) throw mapSupabaseError(error, { resource: 'product_supplier_ref' })
  return (data as ProductSupplierRef[]) ?? []
}
