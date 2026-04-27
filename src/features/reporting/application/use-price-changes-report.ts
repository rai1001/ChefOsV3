'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ReportPriceChangesFilter } from '../domain/filters'
import type { PriceChangeReportRow } from '../domain/price-changes'
import { fetchPriceChangesReport } from '../infrastructure/reporting-rpcs'
import { REPORT_QUERY_OPTIONS } from './query-options'

export function priceChangesReportQueryKey(
  filter: (ReportPriceChangesFilter & { limit?: number }) | undefined
) {
  return ['reporting', 'price-changes', filter?.hotelId, filter ?? null] as const
}

export function usePriceChangesReport(
  filter: (ReportPriceChangesFilter & { limit?: number }) | undefined
) {
  return useQuery<PriceChangeReportRow[]>({
    queryKey: priceChangesReportQueryKey(filter),
    enabled: !!filter?.hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchPriceChangesReport(supabase, filter!)
    },
    ...REPORT_QUERY_OPTIONS,
  })
}
