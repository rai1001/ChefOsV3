'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getEscandalloLive } from '../infrastructure/escandallo-queries'
import type { EscandalloLive } from '../domain/types'

export function useEscandalloLive(
  hotelId: string | undefined,
  recipeId: string | null | undefined
) {
  return useQuery<EscandalloLive>({
    queryKey: ['recipes', 'escandallo', hotelId, recipeId],
    enabled: !!hotelId && !!recipeId,
    queryFn: async () => {
      const supabase = createClient()
      return getEscandalloLive(supabase, hotelId!, recipeId!)
    },
    refetchOnWindowFocus: true,
    refetchInterval: 2 * 60 * 1000, // 2 min
  })
}
