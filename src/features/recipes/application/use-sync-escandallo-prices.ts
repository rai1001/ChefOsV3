'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { syncEscandalloPrices } from '../infrastructure/escandallo-queries'
import type { EscandalloSyncResult } from '../domain/types'

export function useSyncEscandalloPrices(hotelId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (recipeId: string): Promise<EscandalloSyncResult> => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      return syncEscandalloPrices(supabase, hotelId, recipeId)
    },
    onSuccess: (_, recipeId) => {
      qc.invalidateQueries({ queryKey: ['recipes', 'escandallo', hotelId, recipeId] })
      qc.invalidateQueries({ queryKey: ['recipes', 'detail', hotelId, recipeId] })
      qc.invalidateQueries({ queryKey: ['recipes', 'ingredients', hotelId, recipeId] })
    },
  })
}
