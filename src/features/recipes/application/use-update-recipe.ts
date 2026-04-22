'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { updateRecipe, type UpdateRecipeInput } from '../infrastructure/recipe-queries'

interface Args {
  recipeId: string
  input: UpdateRecipeInput
}

export function useUpdateRecipe(hotelId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ recipeId, input }: Args) => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      return updateRecipe(supabase, hotelId, recipeId, input)
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['recipes', 'list'] })
      queryClient.invalidateQueries({
        queryKey: ['recipes', 'detail', hotelId, vars.recipeId],
      })
    },
  })
}
