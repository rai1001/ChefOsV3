'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { duplicateRecipe } from '../infrastructure/recipe-queries'

export function useDuplicateRecipe(hotelId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (recipeId: string): Promise<string> => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      return duplicateRecipe(supabase, hotelId, recipeId)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipes', 'list'] })
    },
  })
}
