import type { SupabaseClient } from '@supabase/supabase-js'
import type { RecipeIngredient } from '../domain/types'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'

export async function fetchRecipeIngredients(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string
): Promise<RecipeIngredient[]> {
  const { data, error } = await supabase
    .from('v3_recipe_ingredients')
    .select('*')
    .eq('recipe_id', recipeId)
    .eq('hotel_id', hotelId)
    .order('sort_order', { ascending: true })
  if (error) throw mapSupabaseError(error, { resource: 'recipe_ingredient' })
  return (data as RecipeIngredient[]) ?? []
}

export interface AddRecipeIngredientInput {
  recipe_id: string
  ingredient_name: string
  product_id?: string | null
  source_recipe_id?: string | null
  unit_id?: string | null
  quantity_gross: number
  waste_pct?: number
  unit_cost?: number
  sort_order?: number
  preparation_notes?: string | null
}

export async function addRecipeIngredient(
  supabase: SupabaseClient,
  hotelId: string,
  input: AddRecipeIngredientInput
): Promise<RecipeIngredient> {
  const { data, error } = await supabase
    .from('v3_recipe_ingredients')
    .insert({
      hotel_id: hotelId,
      recipe_id: input.recipe_id,
      ingredient_name: input.ingredient_name,
      product_id: input.product_id ?? null,
      source_recipe_id: input.source_recipe_id ?? null,
      unit_id: input.unit_id ?? null,
      quantity_gross: input.quantity_gross,
      waste_pct: input.waste_pct ?? 0,
      unit_cost: input.unit_cost ?? 0,
      sort_order: input.sort_order ?? 0,
      preparation_notes: input.preparation_notes ?? null,
    })
    .select()
    .single()
  if (error) throw mapSupabaseError(error, { resource: 'recipe_ingredient' })
  return data as RecipeIngredient
}

export type UpdateRecipeIngredientInput = Partial<Omit<AddRecipeIngredientInput, 'recipe_id'>>

export async function updateRecipeIngredient(
  supabase: SupabaseClient,
  hotelId: string,
  ingredientId: string,
  input: UpdateRecipeIngredientInput
): Promise<RecipeIngredient> {
  const { data, error } = await supabase
    .from('v3_recipe_ingredients')
    .update(input)
    .eq('id', ingredientId)
    .eq('hotel_id', hotelId)
    .select()
    .single()
  if (error) throw mapSupabaseError(error, { resource: 'recipe_ingredient' })
  return data as RecipeIngredient
}

export async function removeRecipeIngredient(
  supabase: SupabaseClient,
  hotelId: string,
  ingredientId: string
): Promise<void> {
  const { error } = await supabase
    .from('v3_recipe_ingredients')
    .delete()
    .eq('id', ingredientId)
    .eq('hotel_id', hotelId)
  if (error) throw mapSupabaseError(error, { resource: 'recipe_ingredient' })
}
