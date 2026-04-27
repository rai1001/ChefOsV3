'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { StockHealthReport } from '../domain/stock-health'
import { fetchStockHealthReport } from '../infrastructure/reporting-rpcs'
import { REPORT_QUERY_OPTIONS } from './query-options'

export function stockHealthReportQueryKey(hotelId: string | undefined) {
  return ['reporting', 'stock-health', hotelId ?? null] as const
}

export function useStockHealthReport(hotelId: string | undefined) {
  return useQuery<StockHealthReport>({
    queryKey: stockHealthReportQueryKey(hotelId),
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchStockHealthReport(supabase, hotelId!)
    },
    ...REPORT_QUERY_OPTIONS,
  })
}
