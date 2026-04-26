'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { PurchaseOrderLine } from '../domain/types'
import { fetchPurchaseOrderLines } from '../infrastructure/purchase-order-queries'

export function usePurchaseOrderLines(
  hotelId: string | undefined,
  orderId: string | undefined
) {
  return useQuery<PurchaseOrderLine[]>({
    queryKey: ['procurement', 'purchase-orders', 'lines', hotelId, orderId],
    enabled: !!hotelId && !!orderId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchPurchaseOrderLines(supabase, hotelId!, orderId!)
    },
  })
}
