import { NotFoundError, ConflictError, ValidationError } from '@/lib/errors'
import type { RecipeStatus } from './types'

export class RecipeNotFoundError extends NotFoundError {
  override readonly code = 'RECIPE_NOT_FOUND' as const
  constructor(
    public readonly recipeId: string,
    message?: string
  ) {
    super('Recipe', message ?? `Receta no encontrada: ${recipeId}`)
    this.name = 'RecipeNotFoundError'
  }
}

export class InvalidRecipeTransitionError extends ConflictError {
  override readonly code = 'INVALID_RECIPE_TRANSITION' as const
  constructor(
    public readonly from: RecipeStatus,
    public readonly to: RecipeStatus,
    message?: string
  ) {
    super(message ?? `Transición no permitida: ${from} → ${to}`)
    this.name = 'InvalidRecipeTransitionError'
  }
}

export class NoIngredientsError extends ValidationError {
  override readonly code = 'NO_INGREDIENTS' as const
  constructor(message = 'La receta requiere al menos un ingrediente antes de enviarse a revisión') {
    super(message)
    this.name = 'NoIngredientsError'
  }
}

export class CircularSubRecipeError extends ConflictError {
  override readonly code = 'CIRCULAR_SUB_RECIPE' as const
  constructor(
    public readonly recipeId: string,
    public readonly subRecipeId: string,
    message?: string
  ) {
    super(message ?? `Dependencia circular: ${recipeId} ↔ ${subRecipeId}`)
    this.name = 'CircularSubRecipeError'
  }
}

export class RecipeLockedError extends ConflictError {
  override readonly code = 'RECIPE_LOCKED' as const
  constructor(
    public readonly status: RecipeStatus,
    message?: string
  ) {
    super(message ?? `La receta está en estado ${status} y no puede modificarse directamente`)
    this.name = 'RecipeLockedError'
  }
}

export class IngredientUnmappedError extends ValidationError {
  override readonly code = 'INGREDIENT_UNMAPPED' as const
  constructor(
    public readonly ingredientName: string,
    message?: string
  ) {
    super(message ?? `El ingrediente "${ingredientName}" no está mapeado a un producto`)
    this.name = 'IngredientUnmappedError'
  }
}

export class SubrecipeCascadeTooDeepError extends ConflictError {
  override readonly code = 'SUBRECIPE_CASCADE_TOO_DEEP' as const

  constructor(
    public readonly recipeId: string,
    public readonly depth: number,
    message?: string
  ) {
    super(message ?? `La cascada de sub-recetas supera la profundidad máxima: ${recipeId}`)
    this.name = 'SubrecipeCascadeTooDeepError'
  }
}

export class RecipePreparationInUseError extends ConflictError {
  override readonly code = 'RECIPE_PREPARATION_IN_USE' as const

  constructor(
    public readonly recipeId: string,
    message?: string
  ) {
    super(message ?? `La preparación está en uso por otras recetas: ${recipeId}`)
    this.name = 'RecipePreparationInUseError'
  }
}

export class SubrecipeOutputMismatchError extends ValidationError {
  override readonly code = 'SUBRECIPE_OUTPUT_MISMATCH' as const

  constructor(
    public readonly sourceRecipeId: string,
    public readonly expectedProductId: string,
    public readonly receivedProductId: string | null,
    message?: string
  ) {
    super(message ?? 'La línea de sub-receta no coincide con el producto de salida')
    this.name = 'SubrecipeOutputMismatchError'
  }
}
