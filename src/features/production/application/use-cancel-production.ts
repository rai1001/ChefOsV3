'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { CancelProductionInput, ProductionOrderDetail } from '../domain/order'
import { cancelProduction } from '../infrastructure/production-rpcs'
import { invalidateProductionOrder } from './invalidate-production'

export function useCancelProduction() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (
      input: CancelProductionInput
    ): Promise<ProductionOrderDetail> => {
      const supabase = createClient()
      return cancelProduction(supabase, input)
    },
    onSuccess: (_, input) => invalidateProductionOrder(qc, input),
  })
}
