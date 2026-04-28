import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import type { MappingResult } from '../domain/types'
import type { MappingPayload } from '../domain/schemas'

// ─── RPC v3_resolve_ingredient_mapping_bulk ───────────────────────────────────

export async function resolveMappingBulk(
  supabase: SupabaseClient,
  hotelId: string,
  payload: MappingPayload
): Promise<MappingResult> {
  const { data, error } = await supabase.rpc('v3_resolve_ingredient_mapping_bulk', {
    p_hotel_id: hotelId,
    p_mapping: payload,
  })
  if (error) throw mapSupabaseError(error, { resource: 'ingredient_mapping' })
  return (
    (data as MappingResult) ?? {
      ok_count: 0,
      failed_count: 0,
      failed: [],
    }
  )
}

// ─── Listado de ingredientes sin mapear (fuente para /recipes/mapping) ────────
//
// Lee v3_recipe_ingredients directamente filtrando product_id IS NULL
// o unit_id IS NULL. Join con v3_recipes para obtener el nombre de la receta.

export interface UnmappedIngredientRow {
  recipe_id: string
  recipe_name: string
  ingredient_id: string
  ingredient_name: string
  quantity_gross: number | null
  waste_pct: number | null
  unit_cost: number | null
  product_id: string | null
  unit_id: string | null
}

export async function fetchUnmappedIngredients(
  supabase: SupabaseClient,
  hotelId: string,
  limit: number = 200
): Promise<UnmappedIngredientRow[]> {
  const { data, error } = await supabase
    .from('v3_recipe_ingredients')
    .select(
      `
        id,
        ingredient_name,
        quantity_gross,
        waste_pct,
        unit_cost,
        product_id,
        unit_id,
        recipe:v3_recipes!inner(id, name)
      `
    )
    .eq('hotel_id', hotelId)
    .or('product_id.is.null,unit_id.is.null')
    .limit(limit)

  if (error) throw mapSupabaseError(error, { resource: 'recipe_ingredient' })

  const UUID_LOOSE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
  const uuidString = () => z.string().regex(UUID_LOOSE, 'Invalid UUID')

  const rowShapeSchema = z.object({
    id: uuidString(),
    ingredient_name: z.string(),
    quantity_gross: z.number().nullable(),
    waste_pct: z.number().nullable(),
    unit_cost: z.number().nullable(),
    product_id: uuidString().nullable(),
    unit_id: uuidString().nullable(),
    recipe: z.union([
      z.object({ id: uuidString(), name: z.string() }),
      z.array(z.object({ id: uuidString(), name: z.string() })),
    ]),
  })

  const rows = z.array(rowShapeSchema).parse(data ?? [])

  return rows
    .map((r) => {
      const recipe = Array.isArray(r.recipe) ? r.recipe[0] : r.recipe
      if (!recipe) return null
      return {
        recipe_id: recipe.id,
        recipe_name: recipe.name,
        ingredient_id: r.id,
        ingredient_name: r.ingredient_name,
        quantity_gross: r.quantity_gross,
        waste_pct: r.waste_pct,
        unit_cost: r.unit_cost,
        product_id: r.product_id,
        unit_id: r.unit_id,
      }
    })
    .filter((row): row is UnmappedIngredientRow => row !== null)
}
