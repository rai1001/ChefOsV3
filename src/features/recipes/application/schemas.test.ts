import { describe, expect, it } from 'vitest'
import {
  addRecipeIngredientSchema,
  updateRecipePreparationSchema,
  updateRecipeSchema,
} from './schemas'

const PRODUCT_ID = '11111111-1111-4111-8111-111111111111'
const RECIPE_ID = '22222222-2222-4222-8222-222222222222'
const UNIT_ID = '33333333-3333-4333-8333-333333333333'

describe('recipe preparation schemas', () => {
  it('valida salida stockable al marcar una receta como preparación', () => {
    const parsed = updateRecipePreparationSchema.parse({
      is_preparation: true,
      output_product_id: PRODUCT_ID,
      output_quantity_per_batch: 2.5,
    })

    expect(parsed.output_quantity_per_batch).toBe(2.5)
  })

  it('rechaza preparación sin producto de salida', () => {
    const result = updateRecipePreparationSchema.safeParse({
      is_preparation: true,
      output_product_id: null,
      output_quantity_per_batch: 2.5,
    })

    expect(result.success).toBe(false)
  })

  it('permite desactivar preparación limpiando salida', () => {
    const parsed = updateRecipeSchema.parse({
      is_preparation: false,
      output_product_id: null,
      output_quantity_per_batch: null,
    })

    expect(parsed.is_preparation).toBe(false)
  })
})

describe('recipe ingredient subrecipe schema', () => {
  it('acepta source_recipe_id cuando la línea apunta a una preparación', () => {
    const parsed = addRecipeIngredientSchema.parse({
      recipe_id: RECIPE_ID,
      ingredient_name: 'Fondo de pescado',
      product_id: PRODUCT_ID,
      source_recipe_id: RECIPE_ID,
      unit_id: UNIT_ID,
      quantity_gross: 0.5,
      waste_pct: 0,
      unit_cost: 0,
      sort_order: 1,
    })

    expect(parsed.source_recipe_id).toBe(RECIPE_ID)
  })
})
