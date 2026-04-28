'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { TraceLotResult } from '../domain/schemas'
import { traceLot } from '../infrastructure/compliance-rpcs'
import { searchTraceableLots, type LotSearchOption } from '../infrastructure/compliance-queries'
import { COMPLIANCE_QUERY_KEYS, COMPLIANCE_QUERY_OPTIONS } from './query-options'

export function useLotTraceability(
  hotelId: string | undefined,
  lotId: string | undefined
) {
  return useQuery<TraceLotResult>({
    queryKey: COMPLIANCE_QUERY_KEYS.traceability(hotelId, lotId),
    enabled: !!hotelId && !!lotId,
    queryFn: async () => {
      const supabase = createClient()
      return traceLot(supabase, { hotel_id: hotelId!, lot_id: lotId! })
    },
    ...COMPLIANCE_QUERY_OPTIONS.traceability,
  })
}

export function useTraceableLots(
  hotelId: string | undefined,
  search: string | undefined
) {
  return useQuery<LotSearchOption[]>({
    queryKey: COMPLIANCE_QUERY_KEYS.lotSearch(hotelId, search),
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return searchTraceableLots(supabase, hotelId!, search)
    },
    ...COMPLIANCE_QUERY_OPTIONS.list,
  })
}

