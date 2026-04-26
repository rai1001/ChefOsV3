'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { CreatePurchaseRequestInput } from '../domain/schemas'
import { createPurchaseRequest } from '../infrastructure/purchase-request-queries'

export function useCreatePR() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreatePurchaseRequestInput): Promise<string> => {
      const supabase = createClient()
      return createPurchaseRequest(supabase, input)
    },
    onSuccess: (requestId) => {
      qc.invalidateQueries({ queryKey: ['procurement', 'purchase-requests', 'list'] })
      qc.invalidateQueries({
        queryKey: ['procurement', 'purchase-requests', 'detail'],
        predicate: (query) => query.queryKey.includes(requestId),
      })
    },
  })
}
