import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { fetchRecipe, getRecipeTechSheet } from '../infrastructure/recipe-queries'
import type { Recipe, RecipeTechSheet } from '../domain/types'

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
