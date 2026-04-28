'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ComplianceCleaningArea } from '../domain/schemas'
import { fetchCleaningAreaList } from '../infrastructure/cleaning-areas-queries'
import { COMPLIANCE_QUERY_KEYS, COMPLIANCE_QUERY_OPTIONS } from './query-options'

export function useCleaningAreaList(
  hotelId: string | undefined,
  options?: { activeOnly?: boolean }
) {
  const activeOnly = options?.activeOnly ?? true
  return useQuery<ComplianceCleaningArea[]>({
    queryKey: COMPLIANCE_QUERY_KEYS.cleaningAreas(hotelId, activeOnly),
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchCleaningAreaList(supabase, { hotelId: hotelId!, activeOnly })
    },
    ...COMPLIANCE_QUERY_OPTIONS.list,
  })
}

