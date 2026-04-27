import { z } from 'zod'

const UUID_LOOSE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

const uuidString = () => z.string().regex(UUID_LOOSE, 'Invalid UUID')

export const productionDeficitSchema = z.object({
  product_id: uuidString(),
  required: z.number().positive(),
  available: z.number().min(0),
  missing: z.number().positive(),
})

export type ProductionDeficit = z.infer<typeof productionDeficitSchema>

export const productionSubrecipeChainNodeSchema = z.object({
  depth: z.number().int().min(1),
  parent_recipe_id: uuidString(),
  recipe_id: uuidString(),
  product_id: uuidString(),
  unit_id: uuidString(),
  required: z.number().positive(),
  available: z.number().min(0),
  missing: z.number().min(0),
  output_quantity_per_batch: z.number().positive(),
  batches_needed: z.number().min(0),
  target_servings: z.number().min(0),
  quantity_to_produce: z.number().min(0),
  will_produce: z.boolean(),
})

export type ProductionSubrecipeChainNode = z.infer<
  typeof productionSubrecipeChainNodeSchema
>

export const productionFeasibilitySchema = z.object({
  feasible: z.boolean(),
  deficits: z.array(productionDeficitSchema),
  subrecipe_chain: z.array(productionSubrecipeChainNodeSchema).default([]),
})

export type ProductionFeasibility = z.infer<typeof productionFeasibilitySchema>

export function getMissingProductionProducts(
  feasibility: ProductionFeasibility
): string[] {
  return feasibility.deficits.map((deficit) => deficit.product_id)
}
