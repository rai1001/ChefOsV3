'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type {
  ConsumeInventoryInput,
  InventoryConsumptionResult,
} from '../domain/movement'
import { consumeInventory } from '../infrastructure/inventory-rpcs'
import { invalidateInventoryProduct } from './invalidate-inventory'

export function useConsumeInventory() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (
      input: ConsumeInventoryInput
    ): Promise<InventoryConsumptionResult> => {
      const supabase = createClient()
      return consumeInventory(supabase, input)
    },
    onSuccess: (_, input) => invalidateInventoryProduct(qc, input),
  })
}
