import type { SupabaseClient } from '@supabase/supabase-js'
import type { RecipeSubRecipe } from '../domain/types'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'

export async function fetchSubRecipes(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string
): Promise<RecipeSubRecipe[]> {
  const { data, error } = await supabase
    .from('v3_recipe_sub_recipes')
    .select('*')
    .eq('recipe_id', recipeId)
    .eq('hotel_id', hotelId)
    .order('created_at', { ascending: true })
  if (error) throw mapSupabaseError(error, { resource: 'recipe_sub_recipe' })
  return (data as RecipeSubRecipe[]) ?? []
}

export interface AddSubRecipeInput {
  recipe_id: string
  sub_recipe_id: string
  quantity: number
  unit_id?: string | null
}

export async function addSubRecipe(
  supabase: SupabaseClient,
  hotelId: string,
  input: AddSubRecipeInput
): Promise<RecipeSubRecipe> {
  const { data, error } = await supabase
    .from('v3_recipe_sub_recipes')
    .insert({
      hotel_id: hotelId,
      recipe_id: input.recipe_id,
      sub_recipe_id: input.sub_recipe_id,
      quantity: input.quantity,
      unit_id: input.unit_id ?? null,
    })
    .select()
    .single()
  if (error) throw mapSupabaseError(error, { resource: 'recipe_sub_recipe' })
  return data as RecipeSubRecipe
}

export async function removeSubRecipe(
  supabase: SupabaseClient,
  hotelId: string,
  subRecipeLinkId: string
): Promise<void> {
  const { error } = await supabase
    .from('v3_recipe_sub_recipes')
    .delete()
    .eq('id', subRecipeLinkId)
    .eq('hotel_id', hotelId)
  if (error) throw mapSupabaseError(error, { resource: 'recipe_sub_recipe' })
}
