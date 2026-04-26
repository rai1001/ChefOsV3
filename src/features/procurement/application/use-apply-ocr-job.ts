'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ApplyOcrJobInput, ApplyOcrJobResult } from '../domain/ocr'
import { applyOcrJob } from '../infrastructure/ocr-rpcs'

export function useApplyOcrJob() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: ApplyOcrJobInput): Promise<ApplyOcrJobResult> => {
      const supabase = createClient()
      return applyOcrJob(supabase, input)
    },
    onSuccess: (result, input) => {
      qc.invalidateQueries({ queryKey: ['procurement', 'ocr-jobs', 'list'] })
      qc.invalidateQueries({
        queryKey: ['procurement', 'ocr-jobs', 'detail', input.job_id],
      })
      qc.invalidateQueries({ queryKey: ['procurement', 'goods-receipts', 'list'] })
      qc.invalidateQueries({
        queryKey: ['procurement', 'goods-receipts', 'detail', result.goods_receipt_id],
      })
      qc.invalidateQueries({ queryKey: ['escandallos'] })
    },
  })
}
