import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Recipe,
  RecipeCategory,
  RecipeCostResult,
  RecipeDifficulty,
  RecipeStatus,
  RecipeTechSheet,
  RecipesFilter,
} from '../domain/types'
import { RecipeNotFoundError } from '../domain/errors'

// ─── Lista / detalle ──────────────────────────────────────────────────────────

export async function fetchRecipes(
  supabase: SupabaseClient,
  hotelId: string,
  filter?: RecipesFilter
): Promise<Recipe[]> {
  let query = supabase
    .from('recipes')
    .select('*')
    .eq('hotel_id', hotelId)
    .order('updated_at', { ascending: false })

  if (filter?.status) {
    const statuses = Array.isArray(filter.status) ? filter.status : [filter.status]
    query = query.in('status', statuses)
  } else {
    query = query.neq('status', 'archived')
  }
  if (filter?.category) query = query.eq('category', filter.category)
  if (filter?.search) query = query.ilike('name', `%${filter.search}%`)

  const { data, error } = await query
  if (error) throw error
  return (data as Recipe[]) ?? []
}

export async function fetchRecipe(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string
): Promise<Recipe> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .eq('hotel_id', hotelId)
    .maybeSingle()
  if (error) throw error
  if (!data) throw new RecipeNotFoundError(recipeId)
  return data as Recipe
}

// ─── Mutaciones básicas (insert/update directo) ───────────────────────────────

export interface CreateRecipeInput {
  name: string
  category: RecipeCategory
  servings: number
  description?: string | null
  subcategory?: string | null
  yield_qty?: number | null
  yield_unit_id?: string | null
  prep_time_min?: number | null
  cook_time_min?: number | null
  rest_time_min?: number | null
  difficulty?: RecipeDifficulty
  target_price?: number | null
  allergens?: string[]
  dietary_tags?: string[]
  notes?: string | null
  image_url?: string | null
}

export async function createRecipe(
  supabase: SupabaseClient,
  hotelId: string,
  userId: string,
  input: CreateRecipeInput
): Promise<Recipe> {
  const { data, error } = await supabase
    .from('recipes')
    .insert({
      hotel_id: hotelId,
      name: input.name,
      description: input.description ?? null,
      category: input.category,
      subcategory: input.subcategory ?? null,
      servings: input.servings,
      yield_qty: input.yield_qty ?? null,
      yield_unit_id: input.yield_unit_id ?? null,
      prep_time_min: input.prep_time_min ?? null,
      cook_time_min: input.cook_time_min ?? null,
      rest_time_min: input.rest_time_min ?? null,
      difficulty: input.difficulty ?? 'medium',
      status: 'draft',
      target_price: input.target_price ?? null,
      allergens: input.allergens ?? [],
      dietary_tags: input.dietary_tags ?? [],
      notes: input.notes ?? null,
      image_url: input.image_url ?? null,
      created_by: userId,
    })
    .select()
    .single()
  if (error) throw error
  return data as Recipe
}

export interface UpdateRecipeInput {
  name?: string
  description?: string | null
  category?: RecipeCategory
  subcategory?: string | null
  servings?: number
  yield_qty?: number | null
  yield_unit_id?: string | null
  prep_time_min?: number | null
  cook_time_min?: number | null
  rest_time_min?: number | null
  difficulty?: RecipeDifficulty
  target_price?: number | null
  allergens?: string[]
  dietary_tags?: string[]
  notes?: string | null
  image_url?: string | null
}

export async function updateRecipe(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string,
  input: UpdateRecipeInput
): Promise<Recipe> {
  const { data, error } = await supabase
    .from('recipes')
    .update(input)
    .eq('id', recipeId)
    .eq('hotel_id', hotelId)
    .select()
    .single()
  if (error) throw error
  return data as Recipe
}

// ─── Workflow RPCs (v2) ───────────────────────────────────────────────────────

export async function submitRecipeForReview(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string
): Promise<void> {
  const { error } = await supabase.rpc('submit_recipe_for_review', {
    p_hotel_id: hotelId,
    p_recipe_id: recipeId,
  })
  if (error) throw error
}

export async function approveRecipe(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string
): Promise<void> {
  const { error } = await supabase.rpc('approve_recipe', {
    p_hotel_id: hotelId,
    p_recipe_id: recipeId,
  })
  if (error) throw error
}

export async function deprecateRecipe(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string
): Promise<void> {
  const { error } = await supabase.rpc('deprecate_recipe', {
    p_hotel_id: hotelId,
    p_recipe_id: recipeId,
  })
  if (error) throw error
}

/**
 * Aplica la transición adecuada según el destino deseado.
 * Mapea el estado destino a la RPC correspondiente.
 */
export async function transitionRecipeTo(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string,
  toStatus: RecipeStatus
): Promise<void> {
  switch (toStatus) {
    case 'review_pending':
      return submitRecipeForReview(supabase, hotelId, recipeId)
    case 'approved':
      return approveRecipe(supabase, hotelId, recipeId)
    case 'deprecated':
      return deprecateRecipe(supabase, hotelId, recipeId)
    case 'draft': {
      // Vuelta atrás desde review_pending: update directo (v2 no expone RPC).
      const { error } = await supabase
        .from('recipes')
        .update({ status: 'draft' })
        .eq('id', recipeId)
        .eq('hotel_id', hotelId)
      if (error) throw error
      return
    }
    case 'archived': {
      const { error } = await supabase
        .from('recipes')
        .update({ status: 'archived' })
        .eq('id', recipeId)
        .eq('hotel_id', hotelId)
      if (error) throw error
      return
    }
    default:
      throw new Error(`transitionRecipeTo: destino no soportado ${toStatus}`)
  }
}

// ─── Cost / utility RPCs ──────────────────────────────────────────────────────

export async function calculateRecipeCost(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string
): Promise<RecipeCostResult> {
  const { data, error } = await supabase.rpc('calculate_recipe_cost', {
    p_hotel_id: hotelId,
    p_recipe_id: recipeId,
  })
  if (error) throw error
  return data as RecipeCostResult
}

export async function duplicateRecipe(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string
): Promise<string> {
  const { data, error } = await supabase.rpc('duplicate_recipe', {
    p_hotel_id: hotelId,
    p_recipe_id: recipeId,
  })
  if (error) throw error
  return data as string
}

export async function scaleRecipe(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string,
  newServings: number
): Promise<unknown> {
  const { data, error } = await supabase.rpc('scale_recipe', {
    p_hotel_id: hotelId,
    p_recipe_id: recipeId,
    p_new_servings: newServings,
  })
  if (error) throw error
  return data
}

export async function getRecipeTechSheet(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string
): Promise<RecipeTechSheet> {
  const { data, error } = await supabase.rpc('get_recipe_tech_sheet', {
    p_hotel_id: hotelId,
    p_recipe_id: recipeId,
  })
  if (error) throw error
  return data as RecipeTechSheet
}
