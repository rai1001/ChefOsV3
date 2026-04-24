'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fetchCatalogPrices } from '../infrastructure/catalog-prices-queries'
import type { CatalogPrice } from '../domain/types'

/**
 * Devuelve precios vigentes (offer_preferred > offer_cheapest) por product_id.
 * Consumible desde módulo recipes para escandallo real con precios de proveedor.
 */
export function useCatalogPrices(
  hotelId: string | undefined,
  productIds: string[] | undefined
) {
  const ids = productIds ?? []
  return useQuery<CatalogPrice[]>({
    queryKey: ['catalog', 'prices', hotelId, [...ids].sort()],
    enabled: !!hotelId && ids.length > 0,
    queryFn: async () => {
      const supabase = createClient()
      return fetchCatalogPrices(supabase, hotelId!, ids)
    },
    staleTime: 30_000, // precios no cambian segundo a segundo
  })
}
