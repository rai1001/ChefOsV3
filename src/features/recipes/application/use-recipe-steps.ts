'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  addRecipeStep,
  fetchRecipeSteps,
  removeRecipeStep,
  updateRecipeStep,
  type AddRecipeStepInput,
  type UpdateRecipeStepInput,
} from '../infrastructure/step-queries'
import type { RecipeStep } from '../domain/types'

const key = (hotelId: string | undefined, recipeId: string | null | undefined) =>
  ['recipes', 'steps', hotelId, recipeId] as const

export function useRecipeSteps(
  hotelId: string | undefined,
  recipeId: string | null | undefined
) {
  return useQuery<RecipeStep[]>({
    queryKey: key(hotelId, recipeId),
    enabled: !!hotelId && !!recipeId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchRecipeSteps(supabase, hotelId!, recipeId!)
    },
  })
}

export function useAddRecipeStep(hotelId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: AddRecipeStepInput) => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      return addRecipeStep(supabase, hotelId, input)
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: key(hotelId, vars.recipe_id) }),
  })
}

export function useUpdateRecipeStep(hotelId: string | undefined, recipeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      stepId,
      input,
    }: {
      stepId: string
      input: UpdateRecipeStepInput
    }) => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      return updateRecipeStep(supabase, hotelId, stepId, input)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key(hotelId, recipeId) }),
  })
}

export function useRemoveRecipeStep(hotelId: string | undefined, recipeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (stepId: string) => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      await removeRecipeStep(supabase, hotelId, stepId)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key(hotelId, recipeId) }),
  })
}
