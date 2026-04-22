import { z } from 'zod'

// Categorías válidas — match con recipes/domain/types.ts.
const RECIPE_CATEGORIES = [
  'starter',
  'main',
  'dessert',
  'sauce',
  'side',
  'drink',
  'bread',
  'pastry',
  'other',
] as const

const RECIPE_DIFFICULTIES = ['easy', 'medium', 'hard'] as const

// ─── Recipe row schema ────────────────────────────────────────────────────────

export const parsedRecipeRowSchema = z.object({
  excel_row: z.number().int().min(1),
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(200),
  category: z.enum(RECIPE_CATEGORIES, {
    message: `categoria debe ser uno de: ${RECIPE_CATEGORIES.join(', ')}`,
  }),
  servings: z.number().int().positive('servings debe ser entero positivo').max(10000),
  description: z.string().trim().max(2000).nullable().optional(),
  subcategory: z.string().trim().max(100).nullable().optional(),
  prep_time_min: z.number().int().min(0).max(10000).nullable().optional(),
  cook_time_min: z.number().int().min(0).max(10000).nullable().optional(),
  rest_time_min: z.number().int().min(0).max(10000).nullable().optional(),
  target_price: z.number().min(0).max(100000).nullable().optional(),
  allergens: z.array(z.string().trim().min(1)).max(50).default([]),
  dietary_tags: z.array(z.string().trim().min(1)).max(50).default([]),
  notes: z.string().trim().max(2000).nullable().optional(),
  difficulty: z.enum(RECIPE_DIFFICULTIES).nullable().optional(),
})

export type ParsedRecipeRowInput = z.input<typeof parsedRecipeRowSchema>

// ─── Ingredient row schema ────────────────────────────────────────────────────

export const parsedIngredientRowSchema = z.object({
  excel_row: z.number().int().min(1),
  recipe_name: z.string().trim().min(1, 'recipe_name es obligatorio').max(200),
  ingredient_name: z.string().trim().min(1, 'ingredient_name es obligatorio').max(200),
  quantity_gross: z
    .number()
    .positive('cantidad_bruta debe ser > 0')
    .max(1_000_000),
  unit: z.string().trim().max(50).nullable().optional(),
  waste_pct: z
    .number()
    .min(0, 'merma_pct debe estar entre 0 y 100')
    .max(100, 'merma_pct debe estar entre 0 y 100')
    .default(0),
  unit_cost: z.number().min(0, 'coste_unitario debe ser ≥ 0').default(0),
  preparation_notes: z.string().trim().max(1000).nullable().optional(),
})

// ─── Payload completo (post-parse, pre-server) ────────────────────────────────

export const importRecipesPayloadSchema = z.object({
  recipes: z.array(parsedRecipeRowSchema).min(1, 'El Excel no tiene recetas válidas'),
  ingredients: z.array(parsedIngredientRowSchema),
})

export type ImportRecipesPayload = z.infer<typeof importRecipesPayloadSchema>
