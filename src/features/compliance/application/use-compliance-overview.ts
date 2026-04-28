'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ComplianceOverview } from '../domain/schemas'
import { fetchComplianceOverview } from '../infrastructure/compliance-rpcs'
import { COMPLIANCE_QUERY_KEYS, COMPLIANCE_QUERY_OPTIONS } from './query-options'

export function useComplianceOverview(hotelId: string | undefined) {
  return useQuery<ComplianceOverview>({
    queryKey: COMPLIANCE_QUERY_KEYS.overview(hotelId),
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchComplianceOverview(supabase, hotelId!)
    },
    ...COMPLIANCE_QUERY_OPTIONS.overview,
  })
}

