/**
 * Contrato público del módulo `recipes` — safe para Client y Server Components.
 *
 * Owner de: fichas técnicas, ingredientes, pasos, sub-recetas, costeo recursivo,
 * escandallo live vs goods_receipts. Menús están en módulo separado `menus`
 * (ver ADR-0010).
 */

// ── Types ──────────────────────────────────────────────────────────
export type {
  Recipe,
  RecipeIngredient,
  RecipeStep,
  RecipeSubRecipe,
  RecipeStatus,
  RecipeCategory,
  RecipeDifficulty,
  RecipeCostResult,
  EscandalloLive,
  EscandalloIngredient,
  EscandalloSyncResult,
  RecipesFilter,
  RecipeTechSheet,
} from './domain/types'

export {
  RECIPE_STATUSES,
  RECIPE_CATEGORIES,
  RECIPE_DIFFICULTIES,
} from './domain/types'

// ── Invariants + labels ────────────────────────────────────────────
export {
  RECIPE_STATUS_LABELS,
  RECIPE_STATUS_VARIANT,
  RECIPE_CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  VALID_RECIPE_TRANSITIONS,
  TERMINAL_RECIPE_STATUSES,
  canTransitionRecipe,
  getValidRecipeTransitions,
  isRecipeLocked,
  canSubmitForReview,
  canApproveRecipe,
  unmappedIngredients,
  isSelfReference,
  priceChangeSignal,
  scaleFactor,
  mergeAllergens,
} from './domain/invariants'

export type { StatusVariant } from './domain/invariants'

// ── Errors ─────────────────────────────────────────────────────────
export {
  RecipeNotFoundError,
  InvalidRecipeTransitionError,
  NoIngredientsError,
  CircularSubRecipeError,
  RecipeLockedError,
  IngredientUnmappedError,
} from './domain/errors'

// ── Application: client hooks ──────────────────────────────────────
export { useRecipes } from './application/use-recipes'
export { useRecipe } from './application/use-recipe'
export { useCreateRecipe } from './application/use-create-recipe'
export { useUpdateRecipe } from './application/use-update-recipe'
export { useTransitionRecipe } from './application/use-transition-recipe'
export {
  useRecipeIngredients,
  useAddRecipeIngredient,
  useUpdateRecipeIngredient,
  useRemoveRecipeIngredient,
} from './application/use-recipe-ingredients'
export {
  useRecipeSteps,
  useAddRecipeStep,
  useUpdateRecipeStep,
  useRemoveRecipeStep,
} from './application/use-recipe-steps'
export {
  useRecipeSubRecipes,
  useAddSubRecipe,
  useRemoveSubRecipe,
} from './application/use-recipe-sub-recipes'
export { useCalculateRecipeCost } from './application/use-calculate-recipe-cost'
export { useDuplicateRecipe } from './application/use-duplicate-recipe'
export { useScaleRecipe } from './application/use-scale-recipe'
export { useEscandalloLive } from './application/use-escandallo-live'
export { useSyncEscandalloPrices } from './application/use-sync-escandallo-prices'
