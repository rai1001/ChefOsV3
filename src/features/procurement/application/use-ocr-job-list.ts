'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { PaginatedResult, PaginationParams } from '@/lib/pagination'
import type { OcrJobListItem, OcrJobsFilter } from '../domain/ocr'
import { fetchOcrJobs } from '../infrastructure/ocr-queries'

export function useOcrJobList(
  filter: OcrJobsFilter | undefined,
  pagination?: PaginationParams
) {
  return useQuery<PaginatedResult<OcrJobListItem>>({
    queryKey: ['procurement', 'ocr-jobs', 'list', filter, pagination ?? null],
    enabled: !!filter?.hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchOcrJobs(supabase, filter!, pagination)
    },
  })
}
