'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ProductionOrderDetail, ProductionOrderIdInput } from '../domain/order'
import { startProduction } from '../infrastructure/production-rpcs'
import { invalidateProductionOrder } from './invalidate-production'

export function useStartProduction() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (
      input: ProductionOrderIdInput
    ): Promise<ProductionOrderDetail> => {
      const supabase = createClient()
      return startProduction(supabase, input)
    },
    onSuccess: (_, input) => {
      invalidateProductionOrder(qc, input, { inventoryChanged: true })
    },
  })
}
