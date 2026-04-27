import { z } from 'zod'

const uuidString = () => z.uuid()

export const productionDeficitSchema = z.object({
  product_id: uuidString(),
  required: z.number().positive(),
  available: z.number().min(0),
  missing: z.number().positive(),
})

export type ProductionDeficit = z.infer<typeof productionDeficitSchema>

export const productionFeasibilitySchema = z.object({
  feasible: z.boolean(),
  deficits: z.array(productionDeficitSchema),
})

export type ProductionFeasibility = z.infer<typeof productionFeasibilitySchema>

export function getMissingProductionProducts(
  feasibility: ProductionFeasibility
): string[] {
  return feasibility.deficits.map((deficit) => deficit.product_id)
}
