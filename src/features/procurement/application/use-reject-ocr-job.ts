'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { RejectOcrJobInput } from '../domain/ocr'
import { rejectOcrJob } from '../infrastructure/ocr-rpcs'

export function useRejectOcrJob() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: RejectOcrJobInput): Promise<void> => {
      const supabase = createClient()
      return rejectOcrJob(supabase, input)
    },
    onSuccess: (_result, input) => {
      qc.invalidateQueries({ queryKey: ['procurement', 'ocr-jobs', 'list'] })
      qc.invalidateQueries({
        queryKey: ['procurement', 'ocr-jobs', 'detail', input.job_id],
      })
    },
  })
}
