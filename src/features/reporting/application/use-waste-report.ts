'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ReportProductFilter } from '../domain/filters'
import type { WasteReportRow } from '../domain/waste'
import { fetchWasteReport } from '../infrastructure/reporting-rpcs'
import { REPORT_QUERY_OPTIONS } from './query-options'

export function wasteReportQueryKey(filter: ReportProductFilter | undefined) {
  return ['reporting', 'waste', filter?.hotelId, filter ?? null] as const
}

export function useWasteReport(filter: ReportProductFilter | undefined) {
  return useQuery<WasteReportRow[]>({
    queryKey: wasteReportQueryKey(filter),
    enabled: !!filter?.hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchWasteReport(supabase, filter!)
    },
    ...REPORT_QUERY_OPTIONS,
  })
}
