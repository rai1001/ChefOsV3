'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { TransitionPurchaseRequestInput } from '../domain/schemas'
import { transitionPurchaseRequest } from '../infrastructure/purchase-request-queries'

export function useTransitionPR() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: TransitionPurchaseRequestInput): Promise<void> => {
      const supabase = createClient()
      await transitionPurchaseRequest(supabase, input)
    },
    onSuccess: (_, input) => {
      qc.invalidateQueries({ queryKey: ['procurement', 'purchase-requests', 'list'] })
      qc.invalidateQueries({
        queryKey: ['procurement', 'purchase-requests', 'detail', input.hotel_id, input.request_id],
      })
    },
  })
}
