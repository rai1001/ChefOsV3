// Dominio recipes — basado en v2 schema (ADR-0003 Supabase compartido).
// Menús se han separado a módulo `menus` por ADR-0010.

export const RECIPE_STATUSES = [
  'draft',
  'review_pending',
  'approved',
  'deprecated',
  'archived',
] as const

export type RecipeStatus = (typeof RECIPE_STATUSES)[number]

export const RECIPE_CATEGORIES = [
  'starter',
  'main',
  'side',
  'dessert',
  'drink',
  'sauce',
  'base',
  'other',
] as const

export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number]

export const RECIPE_DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'] as const
export type RecipeDifficulty = (typeof RECIPE_DIFFICULTIES)[number]

// ─── Entidades ────────────────────────────────────────────────────────────────

export interface Recipe {
  id: string
  hotel_id: string
  name: string
  description: string | null
  category: RecipeCategory
  subcategory: string | null
  servings: number
  yield_qty: number | null
  yield_unit_id: string | null
  prep_time_min: number | null
  cook_time_min: number | null
  rest_time_min: number | null
  difficulty: RecipeDifficulty
  status: RecipeStatus
  total_cost: number
  cost_per_serving: number
  food_cost_pct: number
  target_price: number | null
  allergens: string[]
  dietary_tags: string[]
  notes: string | null
  image_url: string | null
  created_by: string
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface RecipeIngredient {
  id: string
  recipe_id: string
  hotel_id: string
  ingredient_name: string
  product_id: string | null
  unit_id: string | null
  quantity_gross: number
  waste_pct: number
  quantity_net: number
  unit_cost: number
  sort_order: number
  preparation_notes: string | null
  created_at: string
}

export interface RecipeStep {
  id: string
  recipe_id: string
  hotel_id: string
  step_number: number
  instruction: string
  duration_min: number | null
  temperature: string | null
  equipment: string | null
  notes: string | null
  created_at: string
}

export interface RecipeSubRecipe {
  id: string
  recipe_id: string
  sub_recipe_id: string
  quantity: number
  unit_id: string | null
  created_at: string
}

// ─── RPC returns ──────────────────────────────────────────────────────────────

export interface RecipeCostResult {
  recipe_id: string
  ingredient_cost: number
  sub_recipe_cost: number
  total_cost: number
  cost_per_serving: number
  food_cost_pct: number
  servings: number
}

export interface EscandalloIngredient {
  recipe_ingredient_id: string
  ingredient_name: string
  product_id: string | null
  product_name: string | null
  unit_id: string | null
  quantity_gross: number
  quantity_net: number
  waste_pct: number
  recipe_unit_cost: number // snapshot guardado en la receta
  latest_gr_unit_cost: number | null // último albarán (goods_receipt)
  latest_gr_date: string | null
  signal: 'up' | 'down' | 'same' | 'no_data'
  delta_abs: number | null // latest - recipe
  delta_pct: number | null // % cambio
}

export interface EscandalloLive {
  recipe_id: string
  servings: number
  ingredients: EscandalloIngredient[]
  recipe_total_cost: number
  latest_total_cost: number // recomputado con latest_gr prices
  delta_abs: number
  delta_pct: number
  last_computed_at: string
}

export interface EscandalloSyncResult {
  recipe_id: string
  updated_count: number
  total_cost: number
  cost_per_serving: number
  food_cost_pct: number
}

// ─── Filtros ──────────────────────────────────────────────────────────────────

export interface RecipesFilter {
  status?: RecipeStatus | RecipeStatus[]
  category?: RecipeCategory
  search?: string
}

// ─── Tech sheet export (RPC get_recipe_tech_sheet) ────────────────────────────

export interface RecipeTechSheet {
  recipe: Recipe
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  sub_recipes: (RecipeSubRecipe & {
    sub_recipe: Pick<Recipe, 'id' | 'name' | 'cost_per_serving'>
  })[]
}
