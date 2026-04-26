'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { PurchaseOrder } from '../domain/types'
import { fetchPurchaseOrder } from '../infrastructure/purchase-order-queries'

export function usePurchaseOrder(hotelId: string | undefined, orderId: string | undefined) {
  return useQuery<PurchaseOrder>({
    queryKey: ['procurement', 'purchase-orders', 'detail', hotelId, orderId],
    enabled: !!hotelId && !!orderId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchPurchaseOrder(supabase, hotelId!, orderId!)
    },
  })
}
