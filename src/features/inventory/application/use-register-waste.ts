'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type {
  InventoryConsumptionResult,
  RegisterWasteInput,
} from '../domain/movement'
import { registerWaste } from '../infrastructure/inventory-rpcs'
import { invalidateInventoryProduct } from './invalidate-inventory'

export function useRegisterWaste() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (
      input: RegisterWasteInput
    ): Promise<InventoryConsumptionResult> => {
      const supabase = createClient()
      return registerWaste(supabase, input)
    },
    onSuccess: (_, input) => invalidateInventoryProduct(qc, input),
  })
}
