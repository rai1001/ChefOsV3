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
import {
  RecipeNotFoundError,
  RecipePreparationInUseError,
  SubrecipeCascadeTooDeepError,
} from '../domain/errors'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import {
  buildPaginatedResult,
  pageRange,
  type PaginatedResult,
  type PaginationParams,
} from '@/lib/pagination'

interface SupabaseErrorLike {
  code?: string
  message?: string
}

function mapRecipeError(error: unknown, recipeId?: string): never {
  const candidate =
    error !== null && typeof error === 'object'
      ? (error as SupabaseErrorLike)
      : null
  const message = candidate?.message ?? ''
  const lower = message.toLowerCase()

  if (candidate?.code === 'P0017' || lower.includes('cascade too deep')) {
    throw new SubrecipeCascadeTooDeepError(recipeId ?? '', 6, message)
  }

  if (lower.includes('preparation is in use')) {
    throw new RecipePreparationInUseError(recipeId ?? '', message)
  }

  throw mapSupabaseError(error, { resource: 'recipe' })
}

// ─── Lista / detalle ──────────────────────────────────────────────────────────

export async function fetchRecipes(
  supabase: SupabaseClient,
  hotelId: string,
  filter?: RecipesFilter,
  pagination?: PaginationParams
): Promise<PaginatedResult<Recipe>> {
  const { from, to, pageSize } = pageRange(pagination)
  let query = supabase
    .from('v3_recipes')
    .select('*')
    .eq('hotel_id', hotelId)
    .order('updated_at', { ascending: false })
    .range(from, to)

  if (filter?.status) {
    const statuses = Array.isArray(filter.status) ? filter.status : [filter.status]
    query = query.in('status', statuses)
  } else {
    query = query.neq('status', 'archived')
  }
  if (filter?.category) query = query.eq('category', filter.category)
  if (filter?.search) query = query.ilike('name', `%${filter.search}%`)
  if (typeof filter?.isPreparation === 'boolean') {
    query = query.eq('is_preparation', filter.isPreparation)
  }

  const { data, error } = await query
  if (error) throw mapSupabaseError(error, { resource: 'recipe' })
  return buildPaginatedResult((data as Recipe[]) ?? [], pageSize, from)
}

export async function fetchRecipe(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string
): Promise<Recipe> {
  const { data, error } = await supabase
    .from('v3_recipes')
    .select('*')
    .eq('id', recipeId)
    .eq('hotel_id', hotelId)
    .maybeSingle()
  if (error) throw mapSupabaseError(error, { resource: 'recipe' })
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
  is_preparation?: boolean
  output_product_id?: string | null
  output_quantity_per_batch?: number | null
}

export async function createRecipe(
  supabase: SupabaseClient,
  hotelId: string,
  userId: string,
  input: CreateRecipeInput
): Promise<Recipe> {
  const { data, error } = await supabase
    .from('v3_recipes')
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
      is_preparation: input.is_preparation ?? false,
      output_product_id: input.output_product_id ?? null,
      output_quantity_per_batch: input.output_quantity_per_batch ?? null,
      created_by: userId,
    })
    .select()
    .single()
  if (error) mapRecipeError(error)
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
  is_preparation?: boolean
  output_product_id?: string | null
  output_quantity_per_batch?: number | null
}

export async function updateRecipe(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string,
  input: UpdateRecipeInput
): Promise<Recipe> {
  const { data, error } = await supabase
    .from('v3_recipes')
    .update(input)
    .eq('id', recipeId)
    .eq('hotel_id', hotelId)
    .select()
    .single()
  if (error) mapRecipeError(error, recipeId)
  return data as Recipe
}

export interface UpdateRecipePreparationInput {
  is_preparation: boolean
  output_product_id?: string | null
  output_quantity_per_batch?: number | null
}

export async function updateRecipePreparation(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string,
  input: UpdateRecipePreparationInput
): Promise<Recipe> {
  const { data, error } = await supabase
    .from('v3_recipes')
    .update({
      is_preparation: input.is_preparation,
      output_product_id: input.is_preparation ? (input.output_product_id ?? null) : null,
      output_quantity_per_batch: input.is_preparation
        ? (input.output_quantity_per_batch ?? null)
        : null,
    })
    .eq('id', recipeId)
    .eq('hotel_id', hotelId)
    .select()
    .single()

  if (error) mapRecipeError(error, recipeId)
  return data as Recipe
}

export async function isRecipePreparationInUse(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('v3_recipe_ingredients')
    .select('id')
    .eq('hotel_id', hotelId)
    .eq('source_recipe_id', recipeId)
    .limit(1)

  if (error) throw mapSupabaseError(error, { resource: 'recipe_ingredient' })
  return (data?.length ?? 0) > 0
}

// ─── Workflow RPCs (v3_) ─────────────────────────────────────────────────────

export async function submitRecipeForReview(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string
): Promise<void> {
  const { error } = await supabase.rpc('v3_submit_recipe_for_review', {
    p_hotel_id: hotelId,
    p_recipe_id: recipeId,
  })
  if (error) throw mapSupabaseError(error, { resource: 'recipe' })
}

export async function approveRecipe(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string
): Promise<void> {
  const { error } = await supabase.rpc('v3_approve_recipe', {
    p_hotel_id: hotelId,
    p_recipe_id: recipeId,
  })
  if (error) throw mapSupabaseError(error, { resource: 'recipe' })
}

export async function deprecateRecipe(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string
): Promise<void> {
  const { error } = await supabase.rpc('v3_deprecate_recipe', {
    p_hotel_id: hotelId,
    p_recipe_id: recipeId,
  })
  if (error) throw mapSupabaseError(error, { resource: 'recipe' })
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
      // Vuelta atrás desde review_pending: update directo; no hay RPC específica.
      const { error } = await supabase
        .from('v3_recipes')
        .update({ status: 'draft' })
        .eq('id', recipeId)
        .eq('hotel_id', hotelId)
      if (error) throw mapSupabaseError(error, { resource: 'recipe' })
      return
    }
    case 'archived': {
      const { error } = await supabase
        .from('v3_recipes')
        .update({ status: 'archived' })
        .eq('id', recipeId)
        .eq('hotel_id', hotelId)
      if (error) throw mapSupabaseError(error, { resource: 'recipe' })
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
  const { data, error } = await supabase.rpc('v3_calculate_recipe_cost', {
    p_hotel_id: hotelId,
    p_recipe_id: recipeId,
  })
  if (error) throw mapSupabaseError(error, { resource: 'recipe_cost' })
  return data as RecipeCostResult
}

export async function duplicateRecipe(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string
): Promise<string> {
  const { data, error } = await supabase.rpc('v3_duplicate_recipe', {
    p_hotel_id: hotelId,
    p_recipe_id: recipeId,
  })
  if (error) throw mapSupabaseError(error, { resource: 'recipe' })
  return data as string
}

export async function scaleRecipe(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string,
  newServings: number
): Promise<unknown> {
  const { data, error } = await supabase.rpc('v3_scale_recipe', {
    p_hotel_id: hotelId,
    p_recipe_id: recipeId,
    p_new_servings: newServings,
  })
  if (error) throw mapSupabaseError(error, { resource: 'recipe' })
  return data
}

export async function getRecipeTechSheet(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string
): Promise<RecipeTechSheet> {
  const { data, error } = await supabase.rpc('v3_get_recipe_tech_sheet', {
    p_hotel_id: hotelId,
    p_recipe_id: recipeId,
  })
  if (error) throw mapSupabaseError(error, { resource: 'recipe_tech_sheet' })
  return data as RecipeTechSheet
}
