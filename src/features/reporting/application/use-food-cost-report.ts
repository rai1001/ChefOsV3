'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { FoodCostReportRow } from '../domain/food-cost'
import type { ReportBaseFilter } from '../domain/filters'
import { fetchFoodCostReport } from '../infrastructure/reporting-rpcs'
import { REPORT_QUERY_OPTIONS } from './query-options'

export function foodCostReportQueryKey(
  filter: (ReportBaseFilter & { recipeId?: string }) | undefined
) {
  return ['reporting', 'food-cost', filter?.hotelId, filter ?? null] as const
}

export function useFoodCostReport(
  filter: (ReportBaseFilter & { recipeId?: string }) | undefined
) {
  return useQuery<FoodCostReportRow[]>({
    queryKey: foodCostReportQueryKey(filter),
    enabled: !!filter?.hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchFoodCostReport(supabase, filter!)
    },
    ...REPORT_QUERY_OPTIONS,
  })
}
