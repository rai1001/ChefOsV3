'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { TransitionPurchaseOrderInput } from '../domain/schemas'
import { transitionPurchaseOrder } from '../infrastructure/purchase-order-queries'

export function useTransitionPO() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: TransitionPurchaseOrderInput): Promise<void> => {
      const supabase = createClient()
      await transitionPurchaseOrder(supabase, input)
    },
    onSuccess: (_, input) => {
      qc.invalidateQueries({ queryKey: ['procurement', 'purchase-orders', 'list'] })
      qc.invalidateQueries({
        queryKey: ['procurement', 'purchase-orders', 'detail', input.hotel_id, input.order_id],
      })
    },
  })
}
