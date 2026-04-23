'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fetchUnits, fetchUnitsByType } from '../infrastructure/unit-queries'
import type { UnitOfMeasure, UnitType } from '../domain/types'

export function useUnits(hotelId: string | undefined) {
  return useQuery<UnitOfMeasure[]>({
    queryKey: ['catalog', 'units', 'list', hotelId],
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchUnits(supabase, hotelId!)
    },
    staleTime: 60_000, // unidades cambian raramente
  })
}

export function useUnitsByType(hotelId: string | undefined) {
  return useQuery<Record<UnitType, UnitOfMeasure[]> | Record<string, UnitOfMeasure[]>>({
    queryKey: ['catalog', 'units', 'byType', hotelId],
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchUnitsByType(supabase, hotelId!)
    },
    staleTime: 60_000,
  })
}
