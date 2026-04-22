'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { transitionRecipeTo } from '../infrastructure/recipe-queries'
import type { RecipeStatus } from '../domain/types'

interface Args {
  recipeId: string
  to: RecipeStatus
}

export function useTransitionRecipe(hotelId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ recipeId, to }: Args) => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      await transitionRecipeTo(supabase, hotelId, recipeId, to)
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['recipes', 'list'] })
      queryClient.invalidateQueries({
        queryKey: ['recipes', 'detail', hotelId, vars.recipeId],
      })
    },
  })
}
