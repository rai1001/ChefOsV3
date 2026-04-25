import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import type { CatalogPrice } from '../domain/types'

/**
 * RPC v3_get_catalog_prices — devuelve precios vigentes por product_id con
 * precedencia offer_preferred > offer_cheapest.
 */
export async function fetchCatalogPrices(
  supabase: SupabaseClient,
  hotelId: string,
  productIds: string[]
): Promise<CatalogPrice[]> {
  if (productIds.length === 0) return []
  const { data, error } = await supabase.rpc('v3_get_catalog_prices', {
    p_hotel_id: hotelId,
    p_product_ids: productIds,
  })
  if (error) throw mapSupabaseError(error, { resource: 'catalog_prices' })
  return (data as CatalogPrice[]) ?? []
}
