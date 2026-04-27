import { describe, it, expect } from 'vitest'
import {
  canApproveRecipe,
  canSubmitForReview,
  canTransitionRecipe,
  getValidRecipeTransitions,
  isRecipeLocked,
  isSelfReference,
  mergeAllergens,
  priceChangeSignal,
  RECIPE_CATEGORY_LABELS,
  RECIPE_STATUS_LABELS,
  RECIPE_STATUS_VARIANT,
  scaleFactor,
  unmappedIngredients,
  VALID_RECIPE_TRANSITIONS,
} from './invariants'
import {
  RECIPE_CATEGORIES,
  RECIPE_STATUSES,
  type RecipeIngredient,
} from './types'

function ing(overrides: Partial<RecipeIngredient> = {}): RecipeIngredient {
  return {
    id: 'i1',
    recipe_id: 'r1',
    hotel_id: 'h1',
    ingredient_name: 'Tomate',
    product_id: 'p1',
    source_recipe_id: null,
    unit_id: 'u1',
    quantity_gross: 1,
    waste_pct: 0,
    quantity_net: 1,
    unit_cost: 2,
    sort_order: 0,
    preparation_notes: null,
    created_at: '2026-04-22T00:00:00Z',
    ...overrides,
  }
}

describe('canTransitionRecipe', () => {
  it('draft → review_pending permitido', () => {
    expect(canTransitionRecipe('draft', 'review_pending')).toBe(true)
  })
  it('draft → approved NO permitido', () => {
    expect(canTransitionRecipe('draft', 'approved')).toBe(false)
  })
  it('review_pending → approved permitido', () => {
    expect(canTransitionRecipe('review_pending', 'approved')).toBe(true)
  })
  it('review_pending → draft permitido (vuelta atrás)', () => {
    expect(canTransitionRecipe('review_pending', 'draft')).toBe(true)
  })
  it('approved → deprecated permitido', () => {
    expect(canTransitionRecipe('approved', 'deprecated')).toBe(true)
  })
  it('deprecated → approved NO permitido (requiere ADR)', () => {
    expect(canTransitionRecipe('deprecated', 'approved')).toBe(false)
  })
  it('archived no tiene salidas', () => {
    expect(getValidRecipeTransitions('archived')).toEqual([])
  })
})

describe('isRecipeLocked', () => {
  it('draft y review_pending NO están bloqueados', () => {
    expect(isRecipeLocked('draft')).toBe(false)
    expect(isRecipeLocked('review_pending')).toBe(false)
  })
  it('approved, deprecated, archived están bloqueados', () => {
    expect(isRecipeLocked('approved')).toBe(true)
    expect(isRecipeLocked('deprecated')).toBe(true)
    expect(isRecipeLocked('archived')).toBe(true)
  })
})

describe('canSubmitForReview / canApproveRecipe', () => {
  it('submit requiere ≥1 ingrediente', () => {
    expect(canSubmitForReview([])).toBe(false)
    expect(canSubmitForReview([ing()])).toBe(true)
  })
  it('approve requiere status review_pending + ingredientes', () => {
    expect(canApproveRecipe('draft', [ing()])).toBe(false)
    expect(canApproveRecipe('review_pending', [])).toBe(false)
    expect(canApproveRecipe('review_pending', [ing()])).toBe(true)
  })
})

describe('unmappedIngredients', () => {
  it('filtra ingredientes sin product_id', () => {
    const mapped = ing({ id: 'a', product_id: 'p1' })
    const unmapped = ing({ id: 'b', product_id: null })
    expect(unmappedIngredients([mapped, unmapped])).toEqual([unmapped])
  })
})

describe('isSelfReference', () => {
  it('mismo id → true', () => {
    expect(isSelfReference('abc', 'abc')).toBe(true)
  })
  it('distinto id → false', () => {
    expect(isSelfReference('abc', 'xyz')).toBe(false)
  })
})

describe('priceChangeSignal', () => {
  it('subida → up', () => {
    expect(priceChangeSignal(1, 1.5)).toBe('up')
  })
  it('bajada → down', () => {
    expect(priceChangeSignal(2, 1.5)).toBe('down')
  })
  it('igual (dentro de tolerancia) → same', () => {
    expect(priceChangeSignal(1.0001, 1.0001)).toBe('same')
  })
  it('null → no_data', () => {
    expect(priceChangeSignal(null, 1)).toBe('no_data')
    expect(priceChangeSignal(1, null)).toBe('no_data')
    expect(priceChangeSignal(null, null)).toBe('no_data')
  })
})

describe('scaleFactor', () => {
  it('doble pax → factor 2', () => {
    expect(scaleFactor({ servings: 4 }, 8)).toBe(2)
  })
  it('mitad pax → factor 0.5', () => {
    expect(scaleFactor({ servings: 4 }, 2)).toBe(0.5)
  })
  it('servings 0 o target 0 → 1 (safe)', () => {
    expect(scaleFactor({ servings: 0 }, 4)).toBe(1)
    expect(scaleFactor({ servings: 4 }, 0)).toBe(1)
  })
})

describe('mergeAllergens', () => {
  it('dedup + sort', () => {
    const rs = [
      { allergens: ['gluten', 'dairy'] },
      { allergens: ['dairy', 'nuts'] },
      { allergens: [] },
    ]
    expect(mergeAllergens(rs)).toEqual(['dairy', 'gluten', 'nuts'])
  })
  it('lista vacía → []', () => {
    expect(mergeAllergens([])).toEqual([])
  })
})

describe('Labels & variants', () => {
  it('todos los estados tienen label + variant', () => {
    RECIPE_STATUSES.forEach((s) => {
      expect(RECIPE_STATUS_LABELS[s]).toBeDefined()
      expect(RECIPE_STATUS_VARIANT[s]).toBeDefined()
    })
  })
  it('todas las categorías tienen label', () => {
    RECIPE_CATEGORIES.forEach((c) => {
      expect(RECIPE_CATEGORY_LABELS[c]).toBeDefined()
    })
  })
  it('VALID_RECIPE_TRANSITIONS cubre todos los estados', () => {
    RECIPE_STATUSES.forEach((s) => {
      expect(VALID_RECIPE_TRANSITIONS[s]).toBeDefined()
    })
  })
})
