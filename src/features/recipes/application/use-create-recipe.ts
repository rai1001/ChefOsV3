'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { createRecipe, type CreateRecipeInput } from '../infrastructure/recipe-queries'
import type { Recipe } from '../domain/types'

export function useCreateRecipe(hotelId: string | undefined, userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateRecipeInput): Promise<Recipe> => {
      if (!hotelId || !userId) throw new Error('hotelId y userId requeridos')
      const supabase = createClient()
      return createRecipe(supabase, hotelId, userId, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', 'list'] })
    },
  })
}
