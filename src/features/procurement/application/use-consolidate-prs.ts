'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ConsolidatePurchaseRequestsInput } from '../domain/schemas'
import type { GeneratePurchaseOrderResult } from '../domain/types'
import { generatePurchaseOrder } from '../infrastructure/purchase-order-queries'

export function useConsolidatePRs() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (
      input: ConsolidatePurchaseRequestsInput
    ): Promise<GeneratePurchaseOrderResult> => {
      const supabase = createClient()
      return generatePurchaseOrder(supabase, input)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['procurement', 'purchase-requests', 'list'] })
      qc.invalidateQueries({ queryKey: ['procurement', 'purchase-orders', 'list'] })
    },
  })
}
