'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { PurchaseRequest } from '../domain/types'
import { fetchPurchaseRequest } from '../infrastructure/purchase-request-queries'

export function usePurchaseRequest(
  hotelId: string | undefined,
  requestId: string | undefined
) {
  return useQuery<PurchaseRequest>({
    queryKey: ['procurement', 'purchase-requests', 'detail', hotelId, requestId],
    enabled: !!hotelId && !!requestId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchPurchaseRequest(supabase, hotelId!, requestId!)
    },
  })
}
