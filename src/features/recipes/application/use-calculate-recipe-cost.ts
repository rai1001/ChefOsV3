'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { calculateRecipeCost } from '../infrastructure/recipe-queries'
import type { RecipeCostResult } from '../domain/types'

export function useCalculateRecipeCost(hotelId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (recipeId: string): Promise<RecipeCostResult> => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      return calculateRecipeCost(supabase, hotelId, recipeId)
    },
    onSuccess: (_, recipeId) => {
      qc.invalidateQueries({ queryKey: ['recipes', 'detail', hotelId, recipeId] })
      qc.invalidateQueries({ queryKey: ['recipes', 'list'] })
      qc.invalidateQueries({ queryKey: ['recipes', 'escandallo', hotelId, recipeId] })
    },
  })
}
