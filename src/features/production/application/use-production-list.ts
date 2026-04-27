'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ProductionListFilter, ProductionOrderSummary } from '../domain/order'
import { fetchProductionOrders } from '../infrastructure/production-rpcs'

export function useProductionList(filter: ProductionListFilter | undefined) {
  return useQuery<ProductionOrderSummary[]>({
    queryKey: ['production', 'orders', filter?.hotelId, filter ?? null],
    enabled: !!filter?.hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchProductionOrders(supabase, filter!)
    },
  })
}
