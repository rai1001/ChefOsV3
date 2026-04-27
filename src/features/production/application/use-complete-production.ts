'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { CompleteProductionInput, ProductionOrderDetail } from '../domain/order'
import { completeProduction } from '../infrastructure/production-rpcs'
import { invalidateProductionOrder } from './invalidate-production'

export function useCompleteProduction() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (
      input: CompleteProductionInput
    ): Promise<ProductionOrderDetail> => {
      const supabase = createClient()
      return completeProduction(supabase, input)
    },
    onSuccess: (_, input) => invalidateProductionOrder(qc, input),
  })
}
