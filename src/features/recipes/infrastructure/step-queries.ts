import type { SupabaseClient } from '@supabase/supabase-js'
import type { RecipeStep } from '../domain/types'

export async function fetchRecipeSteps(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string
): Promise<RecipeStep[]> {
  const { data, error } = await supabase
    .from('recipe_steps')
    .select('*')
    .eq('recipe_id', recipeId)
    .eq('hotel_id', hotelId)
    .order('step_number', { ascending: true })
  if (error) throw error
  return (data as RecipeStep[]) ?? []
}

export interface AddRecipeStepInput {
  recipe_id: string
  step_number: number
  instruction: string
  duration_min?: number | null
  temperature?: string | null
  equipment?: string | null
  notes?: string | null
}

export async function addRecipeStep(
  supabase: SupabaseClient,
  hotelId: string,
  input: AddRecipeStepInput
): Promise<RecipeStep> {
  const { data, error } = await supabase
    .from('recipe_steps')
    .insert({
      hotel_id: hotelId,
      recipe_id: input.recipe_id,
      step_number: input.step_number,
      instruction: input.instruction,
      duration_min: input.duration_min ?? null,
      temperature: input.temperature ?? null,
      equipment: input.equipment ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return data as RecipeStep
}

export type UpdateRecipeStepInput = Partial<Omit<AddRecipeStepInput, 'recipe_id'>>

export async function updateRecipeStep(
  supabase: SupabaseClient,
  hotelId: string,
  stepId: string,
  input: UpdateRecipeStepInput
): Promise<RecipeStep> {
  const { data, error } = await supabase
    .from('recipe_steps')
    .update(input)
    .eq('id', stepId)
    .eq('hotel_id', hotelId)
    .select()
    .single()
  if (error) throw error
  return data as RecipeStep
}

export async function removeRecipeStep(
  supabase: SupabaseClient,
  hotelId: string,
  stepId: string
): Promise<void> {
  const { error } = await supabase
    .from('recipe_steps')
    .delete()
    .eq('id', stepId)
    .eq('hotel_id', hotelId)
  if (error) throw error
}
