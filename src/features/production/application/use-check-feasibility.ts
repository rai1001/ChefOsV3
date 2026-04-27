'use client'

import { useMutation } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ProductionFeasibility } from '../domain/feasibility'
import type { ProductionOrderIdInput } from '../domain/order'
import { checkProductionFeasibility } from '../infrastructure/production-rpcs'

export function useCheckFeasibility() {
  return useMutation({
    mutationFn: async (
      input: ProductionOrderIdInput
    ): Promise<ProductionFeasibility> => {
      const supabase = createClient()
      return checkProductionFeasibility(supabase, input)
    },
  })
}
