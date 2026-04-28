'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ComplianceTemperatureLog } from '../domain/schemas'
import {
  fetchTemperatureLogs,
  type TemperatureLogFilter,
} from '../infrastructure/compliance-queries'
import { COMPLIANCE_QUERY_KEYS, COMPLIANCE_QUERY_OPTIONS } from './query-options'

export function useTemperatureLogList(filter: TemperatureLogFilter | undefined) {
  return useQuery<ComplianceTemperatureLog[]>({
    queryKey: COMPLIANCE_QUERY_KEYS.temperatureLogs(filter),
    enabled: !!filter?.hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchTemperatureLogs(supabase, filter!)
    },
    ...COMPLIANCE_QUERY_OPTIONS.list,
  })
}
