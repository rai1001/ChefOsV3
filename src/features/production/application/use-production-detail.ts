'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ProductionOrderDetail } from '../domain/order'
import { fetchProductionOrderDetail } from '../infrastructure/production-rpcs'

export function useProductionDetail(
  hotelId: string | undefined,
  orderId: string | undefined
) {
  return useQuery<ProductionOrderDetail>({
    queryKey: ['production', 'order', hotelId, orderId],
    enabled: !!hotelId && !!orderId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchProductionOrderDetail(supabase, hotelId!, orderId!)
    },
  })
}
