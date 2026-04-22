import { z } from 'zod'
import { MENU_TYPES } from '../domain/types'

export const createMenuSchema = z.object({
  name: z.string().min(2).max(200),
  menu_type: z.enum(MENU_TYPES),
  description: z.string().max(2_000).optional().nullable(),
  target_food_cost_pct: z.coerce.number().min(0).max(100).optional().nullable(),
  notes: z.string().max(2_000).optional().nullable(),
  is_template: z.boolean().default(false),
})

export const updateMenuSchema = createMenuSchema.partial().extend({
  is_active: z.boolean().optional(),
})

export const addMenuSectionSchema = z.object({
  menu_id: z.string().uuid(),
  name: z.string().min(2).max(200),
  sort_order: z.coerce.number().int().min(0),
})

export const addRecipeToSectionSchema = z.object({
  section_id: z.string().uuid(),
  recipe_id: z.string().uuid(),
  servings_override: z.coerce.number().positive().optional().nullable(),
  price: z.coerce.number().nonnegative().optional().nullable(),
  sort_order: z.coerce.number().int().min(0),
})

export type CreateMenuInput = z.input<typeof createMenuSchema>
export type UpdateMenuInput = z.input<typeof updateMenuSchema>
export type AddMenuSectionInput = z.input<typeof addMenuSectionSchema>
export type AddRecipeToSectionInput = z.input<typeof addRecipeToSectionSchema>
