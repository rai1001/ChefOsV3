import { describe, expect, it } from 'vitest'
import type { ParsedRecipesPayload } from '../domain/types'
import { validatePayload } from './validate-payload'

function recipe(overrides: Partial<ParsedRecipesPayload['recipes'][0]> = {}) {
  return {
    excel_row: 2,
    name: 'Pollo Asado',
    category: 'main',
    servings: 4,
    description: null,
    subcategory: null,
    prep_time_min: null,
    cook_time_min: null,
    rest_time_min: null,
    target_price: null,
    allergens: [],
    dietary_tags: [],
    notes: null,
    difficulty: null,
    ...overrides,
  }
}

function ingredient(overrides: Partial<ParsedRecipesPayload['ingredients'][0]> = {}) {
  return {
    excel_row: 2,
    recipe_name: 'Pollo Asado',
    ingredient_name: 'Pollo entero',
    quantity_gross: 1,
    unit: 'ud',
    waste_pct: 0,
    unit_cost: 0,
    preparation_notes: null,
    ...overrides,
  }
}

describe('validatePayload', () => {
  it('passes with all valid rows', () => {
    const report = validatePayload({
      recipes: [recipe()],
      ingredients: [ingredient()],
    })
    expect(report.recipeIssues).toEqual([])
    expect(report.ingredientIssues).toEqual([])
    expect(report.validRecipes).toHaveLength(1)
    expect(report.validIngredients).toHaveLength(1)
  })

  it('rejects recipe with invalid category', () => {
    const report = validatePayload({
      recipes: [recipe({ category: 'invalid_cat' })],
      ingredients: [],
    })
    expect(report.recipeIssues.length).toBeGreaterThan(0)
    expect(report.recipeIssues[0]?.field).toBe('category')
    expect(report.validRecipes).toHaveLength(0)
  })

  it('rejects recipe with empty name', () => {
    const report = validatePayload({
      recipes: [recipe({ name: '' })],
      ingredients: [],
    })
    expect(report.recipeIssues.length).toBeGreaterThan(0)
    expect(report.validRecipes).toHaveLength(0)
  })

  it('rejects recipe with non-positive servings', () => {
    const report = validatePayload({
      recipes: [recipe({ servings: 0 })],
      ingredients: [],
    })
    expect(report.recipeIssues.length).toBeGreaterThan(0)
    expect(report.validRecipes).toHaveLength(0)
  })

  it('detects duplicate recipe names (case-insensitive)', () => {
    const report = validatePayload({
      recipes: [
        recipe({ excel_row: 2, name: 'Pollo Asado' }),
        recipe({ excel_row: 5, name: 'POLLO  ASADO' }),
      ],
      ingredients: [],
    })
    expect(report.validRecipes).toHaveLength(1)
    expect(report.validRecipes[0]?.excel_row).toBe(2)
    expect(report.recipeIssues.some((i) => i.excel_row === 5)).toBe(true)
  })

  it('rejects ingredient with non-existent recipe_name', () => {
    const report = validatePayload({
      recipes: [recipe({ name: 'Pollo Asado' })],
      ingredients: [ingredient({ recipe_name: 'No existe', ingredient_name: 'Sal' })],
    })
    expect(report.ingredientIssues.length).toBeGreaterThan(0)
    expect(report.validIngredients).toHaveLength(0)
  })

  it('matches ingredient.recipe_name case-insensitively', () => {
    const report = validatePayload({
      recipes: [recipe({ name: 'Pollo Asado' })],
      ingredients: [ingredient({ recipe_name: '  pollo  asado  ' })],
    })
    expect(report.validIngredients).toHaveLength(1)
  })

  it('keeps valid ingredient even when other ingredients fail', () => {
    const report = validatePayload({
      recipes: [recipe({ name: 'Pollo Asado' })],
      ingredients: [
        ingredient({ excel_row: 2 }),
        ingredient({ excel_row: 3, recipe_name: 'Inexistente', ingredient_name: 'Sal' }),
      ],
    })
    expect(report.validIngredients).toHaveLength(1)
    expect(report.validIngredients[0]?.excel_row).toBe(2)
    expect(report.ingredientIssues.some((i) => i.excel_row === 3)).toBe(true)
  })

  it('rejects ingredient with quantity_gross <= 0', () => {
    const report = validatePayload({
      recipes: [recipe()],
      ingredients: [ingredient({ quantity_gross: 0 })],
    })
    expect(report.ingredientIssues.length).toBeGreaterThan(0)
  })

  it('rejects ingredient with waste_pct out of range', () => {
    const report = validatePayload({
      recipes: [recipe()],
      ingredients: [ingredient({ waste_pct: 150 })],
    })
    expect(report.ingredientIssues.length).toBeGreaterThan(0)
  })
})
