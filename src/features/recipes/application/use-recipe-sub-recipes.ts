'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  addSubRecipe,
  fetchSubRecipes,
  removeSubRecipe,
  type AddSubRecipeInput,
} from '../infrastructure/sub-recipe-queries'
import type { RecipeSubRecipe } from '../domain/types'
import { CircularSubRecipeError } from '../domain/errors'

const key = (recipeId: string | null | undefined) => ['recipes', 'sub-recipes', recipeId] as const

export function useRecipeSubRecipes(recipeId: string | null | undefined) {
  return useQuery<RecipeSubRecipe[]>({
    queryKey: key(recipeId),
    enabled: !!recipeId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchSubRecipes(supabase, recipeId!)
    },
  })
}

export function useAddSubRecipe(hotelId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: AddSubRecipeInput) => {
      if (input.recipe_id === input.sub_recipe_id) {
        throw new CircularSubRecipeError(input.recipe_id, input.sub_recipe_id)
      }
      const supabase = createClient()
      return addSubRecipe(supabase, input)
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: key(vars.recipe_id) })
      qc.invalidateQueries({ queryKey: ['recipes', 'detail', hotelId, vars.recipe_id] })
    },
  })
}

export function useRemoveSubRecipe(recipeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (subRecipeLinkId: string) => {
      const supabase = createClient()
      await removeSubRecipe(supabase, subRecipeLinkId)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key(recipeId) }),
  })
}
