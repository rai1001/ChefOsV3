import { describe, it, expect } from 'vitest'
import {
  CircularSubRecipeError,
  IngredientUnmappedError,
  InvalidRecipeTransitionError,
  NoIngredientsError,
  RecipeLockedError,
  RecipeNotFoundError,
  RecipePreparationInUseError,
  SubrecipeCascadeTooDeepError,
  SubrecipeOutputMismatchError,
} from './errors'

describe('recipes domain errors', () => {
  it('cada error lleva code único', () => {
    const errs = [
      new RecipeNotFoundError('r1'),
      new InvalidRecipeTransitionError('draft', 'approved'),
      new NoIngredientsError(),
      new CircularSubRecipeError('r1', 'r2'),
      new RecipeLockedError('approved'),
      new IngredientUnmappedError('Tomate'),
      new SubrecipeCascadeTooDeepError('r1', 6),
      new RecipePreparationInUseError('r1'),
      new SubrecipeOutputMismatchError('r1', 'p1', 'p2'),
    ]
    const codes = errs.map((e) => e.code)
    expect(new Set(codes).size).toBe(codes.length)
  })

  it('RecipeNotFoundError retiene recipeId', () => {
    const e = new RecipeNotFoundError('r-42')
    expect(e.recipeId).toBe('r-42')
  })

  it('InvalidRecipeTransitionError retiene from/to', () => {
    const e = new InvalidRecipeTransitionError('draft', 'approved')
    expect(e.from).toBe('draft')
    expect(e.to).toBe('approved')
  })

  it('CircularSubRecipeError retiene ids', () => {
    const e = new CircularSubRecipeError('r1', 'r2')
    expect(e.recipeId).toBe('r1')
    expect(e.subRecipeId).toBe('r2')
  })

  it('RecipeLockedError retiene status', () => {
    const e = new RecipeLockedError('deprecated')
    expect(e.status).toBe('deprecated')
  })

  it('IngredientUnmappedError retiene nombre', () => {
    const e = new IngredientUnmappedError('Tomate')
    expect(e.ingredientName).toBe('Tomate')
  })

  it('SubrecipeCascadeTooDeepError retiene recipeId y depth', () => {
    const e = new SubrecipeCascadeTooDeepError('r1', 6)
    expect(e.recipeId).toBe('r1')
    expect(e.depth).toBe(6)
  })

  it('RecipePreparationInUseError retiene recipeId', () => {
    const e = new RecipePreparationInUseError('r1')
    expect(e.recipeId).toBe('r1')
  })

  it('SubrecipeOutputMismatchError retiene producto esperado y recibido', () => {
    const e = new SubrecipeOutputMismatchError('r1', 'p-output', 'p-line')
    expect(e.sourceRecipeId).toBe('r1')
    expect(e.expectedProductId).toBe('p-output')
    expect(e.receivedProductId).toBe('p-line')
  })
})
