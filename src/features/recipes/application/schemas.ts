import { z } from 'zod'
import {
  RECIPE_CATEGORIES,
  RECIPE_DIFFICULTIES,
  RECIPE_STATUSES,
} from '../domain/types'

const UUID_LOOSE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

const uuidString = () => z.string().regex(UUID_LOOSE, 'Invalid UUID')

const recipeBaseSchema = z.object({
  name: z.string().min(2, 'Nombre requerido').max(200),
  category: z.enum(RECIPE_CATEGORIES),
  servings: z.coerce.number().int().min(1).max(10_000),
  description: z.string().max(2_000).optional().nullable(),
  subcategory: z.string().max(100).optional().nullable(),
  yield_qty: z.coerce.number().positive().optional().nullable(),
  yield_unit_id: z.string().uuid().optional().nullable(),
  prep_time_min: z.coerce.number().int().min(0).max(10_000).optional().nullable(),
  cook_time_min: z.coerce.number().int().min(0).max(10_000).optional().nullable(),
  rest_time_min: z.coerce.number().int().min(0).max(10_000).optional().nullable(),
  difficulty: z.enum(RECIPE_DIFFICULTIES).default('medium'),
  target_price: z.coerce.number().nonnegative().optional().nullable(),
  allergens: z.array(z.string()).default([]),
  dietary_tags: z.array(z.string()).default([]),
  notes: z.string().max(5_000).optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  is_preparation: z.boolean().default(false),
  output_product_id: uuidString().optional().nullable(),
  output_quantity_per_batch: z.coerce.number().positive().optional().nullable(),
})

function validatePreparationOutput(
  value: {
    is_preparation?: boolean
    output_product_id?: string | null
    output_quantity_per_batch?: number | null
  },
  ctx: z.RefinementCtx
) {
  if (!value.is_preparation) return

  if (!value.output_product_id) {
    ctx.addIssue({
      code: 'custom',
      path: ['output_product_id'],
      message: 'Producto de salida requerido',
    })
  }

  if (!value.output_quantity_per_batch || value.output_quantity_per_batch <= 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['output_quantity_per_batch'],
      message: 'Cantidad de salida requerida',
    })
  }
}

export const createRecipeSchema = recipeBaseSchema.superRefine(validatePreparationOutput)

export const updateRecipeSchema = recipeBaseSchema
  .partial()
  .superRefine(validatePreparationOutput)

export const updateRecipePreparationSchema = z.object({
  is_preparation: z.boolean(),
  output_product_id: uuidString().optional().nullable(),
  output_quantity_per_batch: z.coerce.number().positive().optional().nullable(),
}).superRefine(validatePreparationOutput)

export const addRecipeIngredientSchema = z.object({
  recipe_id: uuidString(),
  ingredient_name: z.string().min(1).max(200),
  product_id: uuidString().optional().nullable(),
  source_recipe_id: uuidString().optional().nullable(),
  unit_id: uuidString().optional().nullable(),
  quantity_gross: z.coerce.number().positive(),
  waste_pct: z.coerce.number().min(0).max(100).default(0),
  unit_cost: z.coerce.number().nonnegative().default(0),
  sort_order: z.coerce.number().int().default(0),
  preparation_notes: z.string().max(500).optional().nullable(),
})

export const addRecipeStepSchema = z.object({
  recipe_id: uuidString(),
  step_number: z.coerce.number().int().min(1),
  instruction: z.string().min(1).max(2_000),
  duration_min: z.coerce.number().int().min(0).max(10_000).optional().nullable(),
  temperature: z.string().max(50).optional().nullable(),
  equipment: z.string().max(200).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

export const addSubRecipeSchema = z.object({
  recipe_id: uuidString(),
  sub_recipe_id: uuidString(),
  quantity: z.coerce.number().positive(),
  unit_id: uuidString().optional().nullable(),
})

export const transitionRecipeSchema = z.object({
  recipe_id: uuidString(),
  to: z.enum(RECIPE_STATUSES),
})

export type CreateRecipeInput = z.input<typeof createRecipeSchema>
export type UpdateRecipeInput = z.input<typeof updateRecipeSchema>
export type AddRecipeIngredientInput = z.input<typeof addRecipeIngredientSchema>
export type AddRecipeStepInput = z.input<typeof addRecipeStepSchema>
export type AddSubRecipeInput = z.input<typeof addSubRecipeSchema>
export type UpdateRecipePreparationInput = z.input<typeof updateRecipePreparationSchema>
