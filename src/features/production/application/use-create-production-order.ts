'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { CreateProductionOrderInput } from '../domain/order'
import { createProductionOrder } from '../infrastructure/production-rpcs'

export function useCreateProductionOrder() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateProductionOrderInput) => {
      const supabase = createClient()
      return createProductionOrder(supabase, input)
    },
    onSuccess: (_, input) => {
      qc.invalidateQueries({ queryKey: ['production', 'orders', input.hotel_id] })
    },
  })
}
