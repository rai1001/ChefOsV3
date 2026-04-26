'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ReviewOcrJobInput } from '../domain/ocr'
import { reviewOcrJob } from '../infrastructure/ocr-rpcs'

export function useReviewOcrJob() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: ReviewOcrJobInput): Promise<void> => {
      const supabase = createClient()
      return reviewOcrJob(supabase, input)
    },
    onSuccess: (_result, input) => {
      qc.invalidateQueries({ queryKey: ['procurement', 'ocr-jobs', 'list'] })
      qc.invalidateQueries({
        queryKey: ['procurement', 'ocr-jobs', 'detail', input.job_id],
      })
    },
  })
}
