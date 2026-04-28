'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { QualityCheckInput, QualityCheckRpcResult } from '../domain/schemas'
import { recordGoodsReceiptQualityCheck } from '../infrastructure/compliance-rpcs'

export function useQualityCheck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: QualityCheckInput): Promise<QualityCheckRpcResult> => {
      const supabase = createClient()
      return recordGoodsReceiptQualityCheck(supabase, input)
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['compliance', 'overview'] })
      queryClient.invalidateQueries({ queryKey: ['compliance', 'quality-checks'] })
      queryClient.setQueryData(
        ['compliance', 'quality-check', result.row.hotel_id, result.row.goods_receipt_id],
        result.row
      )
    },
  })
}

