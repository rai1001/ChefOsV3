'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { PaginatedResult, PaginationParams } from '@/lib/pagination'
import type { PurchaseRequest, PurchaseRequestsFilter } from '../domain/types'
import { fetchPurchaseRequests } from '../infrastructure/purchase-request-queries'

export function usePurchaseRequests(
  filter: PurchaseRequestsFilter | undefined,
  pagination?: PaginationParams
) {
  return useQuery<PaginatedResult<PurchaseRequest>>({
    queryKey: ['procurement', 'purchase-requests', 'list', filter, pagination ?? null],
    enabled: !!filter?.hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchPurchaseRequests(supabase, filter!, pagination)
    },
  })
}
