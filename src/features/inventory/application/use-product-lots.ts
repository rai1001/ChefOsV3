'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { InventoryLotDetail } from '../domain/lot'
import { fetchProductLots } from '../infrastructure/inventory-queries'

export function useProductLots(hotelId: string | undefined, productId: string | undefined) {
  return useQuery<InventoryLotDetail[]>({
    queryKey: ['inventory', 'lots', hotelId, productId],
    enabled: !!hotelId && !!productId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchProductLots(supabase, hotelId!, productId!)
    },
  })
}
