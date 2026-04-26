'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { PaginatedResult, PaginationParams } from '@/lib/pagination'
import type { PurchaseOrder, PurchaseOrdersFilter } from '../domain/types'
import { fetchPurchaseOrders } from '../infrastructure/purchase-order-queries'

export function usePurchaseOrders(
  filter: PurchaseOrdersFilter | undefined,
  pagination?: PaginationParams
) {
  return useQuery<PaginatedResult<PurchaseOrder>>({
    queryKey: ['procurement', 'purchase-orders', 'list', filter, pagination ?? null],
    enabled: !!filter?.hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchPurchaseOrders(supabase, filter!, pagination)
    },
  })
}
