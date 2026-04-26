'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { TriggerOcrExtractInput, TriggerOcrExtractResult } from '../domain/ocr'
import { triggerOcrExtract } from '../infrastructure/ocr-rpcs'

export function useTriggerOcrExtract() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (
      input: TriggerOcrExtractInput
    ): Promise<TriggerOcrExtractResult> => {
      const supabase = createClient()
      return triggerOcrExtract(supabase, input)
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['procurement', 'ocr-jobs', 'list'] })
      qc.invalidateQueries({
        queryKey: ['procurement', 'ocr-jobs', 'detail', result.jobId],
      })
    },
  })
}
