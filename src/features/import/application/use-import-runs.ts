'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fetchImportRuns } from '../infrastructure/import-queries'
import type { ImportRun } from '../domain/types'
import { type PaginatedResult, type PaginationParams } from '@/lib/pagination'

export function useImportRuns(
  hotelId: string | undefined,
  pagination?: PaginationParams
) {
  return useQuery<PaginatedResult<ImportRun>>({
    queryKey: ['import', hotelId, 'runs', pagination ?? null],
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchImportRuns(supabase, hotelId!, pagination)
    },
  })
}
