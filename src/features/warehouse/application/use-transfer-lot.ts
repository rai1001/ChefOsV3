'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { TransferLotInput, TransferLotResult } from '../domain/schemas'
import { transferLotQuantity } from '../infrastructure/warehouse-rpcs'

export function useTransferLot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: TransferLotInput): Promise<TransferLotResult> => {
      const supabase = createClient()
      return transferLotQuantity(supabase, input)
    },
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'snapshot'] })
      queryClient.invalidateQueries({ queryKey: ['inventory', 'lots'] })
      queryClient.invalidateQueries({ queryKey: ['inventory', 'movements'] })
      queryClient.invalidateQueries({ queryKey: ['warehouse-stock', input.hotel_id] })
    },
  })
}
