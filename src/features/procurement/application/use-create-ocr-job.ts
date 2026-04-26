'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { CreateOcrJobInput } from '../domain/ocr'
import { createOcrJob } from '../infrastructure/ocr-rpcs'

export function useCreateOcrJob() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateOcrJobInput): Promise<string> => {
      const supabase = createClient()
      return createOcrJob(supabase, input)
    },
    onSuccess: (jobId) => {
      qc.invalidateQueries({ queryKey: ['procurement', 'ocr-jobs', 'list'] })
      qc.invalidateQueries({
        queryKey: ['procurement', 'ocr-jobs', 'detail', jobId],
      })
    },
  })
}
