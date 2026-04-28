'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ComplianceQualityCheck } from '../domain/schemas'
import type { ComplianceBaseFilter } from '../domain/filters'
import { fetchQualityChecks } from '../infrastructure/compliance-queries'
import { COMPLIANCE_QUERY_KEYS, COMPLIANCE_QUERY_OPTIONS } from './query-options'

export function useQualityCheckList(filter: ComplianceBaseFilter | undefined) {
  return useQuery<ComplianceQualityCheck[]>({
    queryKey: COMPLIANCE_QUERY_KEYS.qualityChecks(filter),
    enabled: !!filter?.hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchQualityChecks(supabase, filter!)
    },
    ...COMPLIANCE_QUERY_OPTIONS.list,
  })
}

