'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ReportTopProductsFilter } from '../domain/filters'
import type { TopProductReportRow } from '../domain/top-products'
import { fetchTopProductsReport } from '../infrastructure/reporting-rpcs'
import { REPORT_QUERY_OPTIONS } from './query-options'

export function topProductsReportQueryKey(filter: ReportTopProductsFilter | undefined) {
  return ['reporting', 'top-products', filter?.hotelId, filter ?? null] as const
}

export function useTopProductsReport(filter: ReportTopProductsFilter | undefined) {
  return useQuery<TopProductReportRow[]>({
    queryKey: topProductsReportQueryKey(filter),
    enabled: !!filter?.hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchTopProductsReport(supabase, filter!)
    },
    ...REPORT_QUERY_OPTIONS,
  })
}
