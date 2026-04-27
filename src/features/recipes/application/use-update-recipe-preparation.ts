'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  isRecipePreparationInUse,
  updateRecipePreparation,
  type UpdateRecipePreparationInput,
} from '../infrastructure/recipe-queries'

interface Args {
  recipeId: string
  input: UpdateRecipePreparationInput
}

export function useUpdateRecipePreparation(hotelId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ recipeId, input }: Args) => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      return updateRecipePreparation(supabase, hotelId, recipeId, input)
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['recipes', 'list'] })
      queryClient.invalidateQueries({
        queryKey: ['recipes', 'detail', hotelId, vars.recipeId],
      })
      queryClient.invalidateQueries({
        queryKey: ['recipes', 'preparation-usage', hotelId, vars.recipeId],
      })
    },
  })
}

export function useRecipePreparationUsage(
  hotelId: string | undefined,
  recipeId: string | undefined
) {
  return useQuery<boolean>({
    queryKey: ['recipes', 'preparation-usage', hotelId, recipeId],
    enabled: !!hotelId && !!recipeId,
    queryFn: async () => {
      const supabase = createClient()
      return isRecipePreparationInUse(supabase, hotelId!, recipeId!)
    },
  })
}
