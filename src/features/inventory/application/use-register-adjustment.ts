'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type {
  InventoryAdjustmentResult,
  RegisterAdjustmentInput,
} from '../domain/movement'
import { registerAdjustment } from '../infrastructure/inventory-rpcs'
import { invalidateInventoryProduct } from './invalidate-inventory'

export function useRegisterAdjustment() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (
      input: RegisterAdjustmentInput
    ): Promise<InventoryAdjustmentResult> => {
      const supabase = createClient()
      return registerAdjustment(supabase, input)
    },
    onSuccess: (_, input) => invalidateInventoryProduct(qc, input),
  })
}
