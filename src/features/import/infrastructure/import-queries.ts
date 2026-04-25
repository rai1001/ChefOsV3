import type { SupabaseClient } from '@supabase/supabase-js'
import type { ImportRun, ImportResult, ParsedIngredientRow, ParsedRecipeRow } from '../domain/types'
import { ImportRunNotFoundError } from '../domain/errors'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import {
  buildPaginatedResult,
  pageRange,
  type PaginatedResult,
  type PaginationParams,
} from '@/lib/pagination'

// ─── RPC bulk ────────────────────────────────────────────────────────────────

export interface ImportRecipesRpcPayload {
  recipes: Array<Pick<
    ParsedRecipeRow,
    | 'name'
    | 'category'
    | 'servings'
    | 'description'
    | 'subcategory'
    | 'prep_time_min'
    | 'cook_time_min'
    | 'rest_time_min'
    | 'target_price'
    | 'allergens'
    | 'dietary_tags'
    | 'notes'
    | 'difficulty'
  >>
  ingredients: Array<Pick<
    ParsedIngredientRow,
    | 'recipe_name'
    | 'ingredient_name'
    | 'quantity_gross'
    | 'waste_pct'
    | 'unit_cost'
    | 'preparation_notes'
  >>
}

export async function importRecipesBulk(
  supabase: SupabaseClient,
  hotelId: string,
  payload: ImportRecipesRpcPayload
): Promise<ImportResult> {
  const { data, error } = await supabase.rpc('v3_import_recipes_bulk', {
    p_hotel_id: hotelId,
    p_payload: payload,
  })
  if (error) throw mapSupabaseError(error, { resource: 'import_run' })
  return data as ImportResult
}

// ─── Histórico de runs ───────────────────────────────────────────────────────

export async function fetchImportRuns(
  supabase: SupabaseClient,
  hotelId: string,
  pagination?: PaginationParams
): Promise<PaginatedResult<ImportRun>> {
  const { from, to, pageSize } = pageRange(pagination)
  const { data, error } = await supabase
    .from('v3_import_runs')
    .select('*')
    .eq('hotel_id', hotelId)
    .order('started_at', { ascending: false })
    .range(from, to)
  if (error) throw mapSupabaseError(error, { resource: 'import_run' })
  return buildPaginatedResult((data as ImportRun[]) ?? [], pageSize, from)
}

export async function fetchImportRun(
  supabase: SupabaseClient,
  hotelId: string,
  runId: string
): Promise<ImportRun> {
  const { data, error } = await supabase
    .from('v3_import_runs')
    .select('*')
    .eq('id', runId)
    .eq('hotel_id', hotelId)
    .maybeSingle()
  if (error) throw mapSupabaseError(error, { resource: 'import_run' })
  if (!data) throw new ImportRunNotFoundError(runId)
  return data as ImportRun
}
