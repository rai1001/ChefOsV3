import type {
  Recipe,
  RecipeCategory,
  RecipeDifficulty,
  RecipeIngredient,
  RecipeStatus,
} from './types'

// ─── Labels ───────────────────────────────────────────────────────────────────

export const RECIPE_STATUS_LABELS: Record<RecipeStatus, string> = {
  draft: 'Borrador',
  review_pending: 'Pendiente revisión',
  approved: 'Aprobada',
  deprecated: 'Obsoleta',
  archived: 'Archivada',
}

export type StatusVariant = 'neutral' | 'warning' | 'success' | 'info' | 'urgent'

export const RECIPE_STATUS_VARIANT: Record<RecipeStatus, StatusVariant> = {
  draft: 'neutral',
  review_pending: 'warning',
  approved: 'success',
  deprecated: 'urgent',
  archived: 'neutral',
}

export const RECIPE_CATEGORY_LABELS: Record<RecipeCategory, string> = {
  starter: 'Entrante',
  main: 'Principal',
  side: 'Guarnición',
  dessert: 'Postre',
  drink: 'Bebida',
  sauce: 'Salsa',
  base: 'Base / Preparación',
  other: 'Otros',
}

export const DIFFICULTY_LABELS: Record<RecipeDifficulty, string> = {
  easy: 'Fácil',
  medium: 'Media',
  hard: 'Difícil',
  expert: 'Experto',
}

// ─── State machine ────────────────────────────────────────────────────────────

/**
 * Transiciones permitidas del ciclo de vida de una receta.
 * La RPC `transition_recipe` en Supabase es la fuente de verdad final;
 * este mapa se usa en UI para ocultar botones imposibles.
 */
export const VALID_RECIPE_TRANSITIONS: Record<RecipeStatus, readonly RecipeStatus[]> = {
  draft: ['review_pending', 'archived'],
  review_pending: ['approved', 'draft'],
  approved: ['deprecated'],
  deprecated: ['archived'],
  archived: [],
}

export const TERMINAL_RECIPE_STATUSES: readonly RecipeStatus[] = ['archived']

export function canTransitionRecipe(from: RecipeStatus, to: RecipeStatus): boolean {
  return VALID_RECIPE_TRANSITIONS[from].includes(to)
}

export function getValidRecipeTransitions(from: RecipeStatus): readonly RecipeStatus[] {
  return VALID_RECIPE_TRANSITIONS[from]
}

export function isRecipeLocked(status: RecipeStatus): boolean {
  return status === 'approved' || status === 'deprecated' || status === 'archived'
}

// ─── Invariantes de negocio ───────────────────────────────────────────────────

/**
 * Para enviar a review, la receta necesita al menos 1 ingrediente.
 * La RPC valida también; este check permite feedback inmediato en UI.
 */
export function canSubmitForReview(ingredients: ReadonlyArray<RecipeIngredient>): boolean {
  return ingredients.length >= 1
}

export function canApproveRecipe(
  status: RecipeStatus,
  ingredients: ReadonlyArray<RecipeIngredient>
): boolean {
  if (status !== 'review_pending') return false
  return ingredients.length >= 1
}

/**
 * Detecta ingredientes sin product_id (pendientes de mapeo a catálogo).
 */
export function unmappedIngredients(
  ingredients: ReadonlyArray<RecipeIngredient>
): readonly RecipeIngredient[] {
  return ingredients.filter((i) => i.product_id === null)
}

/**
 * Cycle detection local para UI (defensa en profundidad; RPC también valida).
 * No navega recursivamente — solo detecta el caso trivial (A → A).
 */
export function isSelfReference(recipeId: string, subRecipeId: string): boolean {
  return recipeId === subRecipeId
}

// ─── Signals de cambio de precio ──────────────────────────────────────────────

export function priceChangeSignal(
  oldCost: number | null | undefined,
  newCost: number | null | undefined,
  tolerance = 0.0001
): 'up' | 'down' | 'same' | 'no_data' {
  if (oldCost == null || newCost == null) return 'no_data'
  const diff = newCost - oldCost
  if (Math.abs(diff) < tolerance) return 'same'
  return diff > 0 ? 'up' : 'down'
}

// ─── Scaling helper ───────────────────────────────────────────────────────────

/**
 * Factor para escalar una receta a nuevos servings.
 * factor = target_servings / recipe.servings.
 */
export function scaleFactor(recipe: Pick<Recipe, 'servings'>, targetServings: number): number {
  if (recipe.servings <= 0 || targetServings <= 0) return 1
  return targetServings / recipe.servings
}

// ─── Allergen aggregation ─────────────────────────────────────────────────────

/**
 * Une los alérgenos de varias recetas (dedup + ordena).
 * Útil para computar alérgenos de una sección de menú.
 */
export function mergeAllergens(recipes: ReadonlyArray<Pick<Recipe, 'allergens'>>): string[] {
  return Array.from(new Set(recipes.flatMap((r) => r.allergens))).sort()
}
