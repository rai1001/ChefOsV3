import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { fetchRecipe, getRecipeTechSheet } from '../infrastructure/recipe-queries'
import { fetchRecipeIngredients } from '../infrastructure/ingredient-queries'
import type { Recipe, RecipeIngredient, RecipeTechSheet } from '../domain/types'

export async function getRecipeServer(hotelId: string, recipeId: string): Promise<Recipe> {
  const supabase = await createClient()
  return fetchRecipe(supabase, hotelId, recipeId)
}

export async function getRecipeTechSheetServer(
  hotelId: string,
  recipeId: string
): Promise<RecipeTechSheet> {
  const supabase = await createClient()
  return getRecipeTechSheet(supabase, hotelId, recipeId)
}

export async function getRecipeIngredientsServer(
  hotelId: string,
  recipeId: string
): Promise<RecipeIngredient[]> {
  const supabase = await createClient()
  return fetchRecipeIngredients(supabase, hotelId, recipeId)
}

export async function getRecipeWithIngredientsServer(
  hotelId: string,
  recipeId: string
): Promise<{ recipe: Recipe; ingredients: RecipeIngredient[] }> {
  const supabase = await createClient()
  const [recipe, ingredients] = await Promise.all([
    fetchRecipe(supabase, hotelId, recipeId),
    fetchRecipeIngredients(supabase, hotelId, recipeId),
  ])
  return { recipe, ingredients }
}
