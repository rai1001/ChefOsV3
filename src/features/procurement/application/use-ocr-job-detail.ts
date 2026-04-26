'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { OcrJobDetail } from '../domain/ocr'
import { fetchOcrJob } from '../infrastructure/ocr-queries'

export function useOcrJobDetail(jobId: string | undefined) {
  return useQuery<OcrJobDetail>({
    queryKey: ['procurement', 'ocr-jobs', 'detail', jobId],
    enabled: !!jobId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchOcrJob(supabase, jobId!)
    },
  })
}
