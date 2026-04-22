'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  addRecipeIngredient,
  fetchRecipeIngredients,
  removeRecipeIngredient,
  updateRecipeIngredient,
  type AddRecipeIngredientInput,
  type UpdateRecipeIngredientInput,
} from '../infrastructure/ingredient-queries'
import type { RecipeIngredient } from '../domain/types'

const key = (hotelId: string | undefined, recipeId: string | null | undefined) =>
  ['recipes', 'ingredients', hotelId, recipeId] as const

function invalidateRecipe(
  qc: ReturnType<typeof useQueryClient>,
  hotelId: string | undefined,
  recipeId: string
) {
  qc.invalidateQueries({ queryKey: key(hotelId, recipeId) })
  qc.invalidateQueries({ queryKey: ['recipes', 'detail', hotelId, recipeId] })
  qc.invalidateQueries({ queryKey: ['recipes', 'escandallo', hotelId, recipeId] })
}

export function useRecipeIngredients(
  hotelId: string | undefined,
  recipeId: string | null | undefined
) {
  return useQuery<RecipeIngredient[]>({
    queryKey: key(hotelId, recipeId),
    enabled: !!hotelId && !!recipeId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchRecipeIngredients(supabase, hotelId!, recipeId!)
    },
  })
}

export function useAddRecipeIngredient(hotelId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: AddRecipeIngredientInput) => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      return addRecipeIngredient(supabase, hotelId, input)
    },
    onSuccess: (_, vars) => invalidateRecipe(qc, hotelId, vars.recipe_id),
  })
}

export function useUpdateRecipeIngredient(hotelId: string | undefined, recipeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      ingredientId,
      input,
    }: {
      ingredientId: string
      input: UpdateRecipeIngredientInput
    }) => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      return updateRecipeIngredient(supabase, hotelId, ingredientId, input)
    },
    onSuccess: () => invalidateRecipe(qc, hotelId, recipeId),
  })
}

export function useRemoveRecipeIngredient(hotelId: string | undefined, recipeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (ingredientId: string) => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      await removeRecipeIngredient(supabase, hotelId, ingredientId)
    },
    onSuccess: () => invalidateRecipe(qc, hotelId, recipeId),
  })
}
