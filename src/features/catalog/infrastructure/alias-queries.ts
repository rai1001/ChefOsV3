import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import type { ProductAlias, ProductMatch } from '../domain/types'
import type { AliasInput } from '../domain/schemas'

// ─── Lista ────────────────────────────────────────────────────────────────────

export async function fetchAliasesForProduct(
  supabase: SupabaseClient,
  hotelId: string,
  productId: string
): Promise<ProductAlias[]> {
  const { data, error } = await supabase
    .from('v3_product_aliases')
    .select('*')
    .eq('hotel_id', hotelId)
    .eq('product_id', productId)
    .order('confidence_score', { ascending: false })
  if (error) throw mapSupabaseError(error, { resource: 'product_alias' })
  return (data as ProductAlias[]) ?? []
}

// ─── Mutación: add ────────────────────────────────────────────────────────────

export async function addAlias(
  supabase: SupabaseClient,
  input: AliasInput
): Promise<ProductAlias> {
  const { data, error } = await supabase
    .from('v3_product_aliases')
    .insert({
      hotel_id: input.hotel_id,
      product_id: input.product_id,
      alias_name: input.alias_name.trim(),
      source_type: input.source_type,
      confidence_score: input.confidence_score,
    })
    .select('*')
    .single()
  if (error) throw mapSupabaseError(error, { resource: 'product_alias' })
  return data as ProductAlias
}

export async function removeAlias(
  supabase: SupabaseClient,
  hotelId: string,
  aliasId: string
): Promise<void> {
  const { error } = await supabase
    .from('v3_product_aliases')
    .delete()
    .eq('id', aliasId)
    .eq('hotel_id', hotelId)
  if (error) throw mapSupabaseError(error, { resource: 'product_alias' })
}

// ─── RPC v3_match_product_by_alias (pg_trgm) ──────────────────────────────────

export async function matchProductByAlias(
  supabase: SupabaseClient,
  hotelId: string,
  query: string,
  limit: number = 10
): Promise<ProductMatch[]> {
  const { data, error } = await supabase.rpc('v3_match_product_by_alias', {
    p_hotel_id: hotelId,
    p_query: query,
    p_limit: limit,
  })
  if (error) throw mapSupabaseError(error, { resource: 'product_alias' })
  return (data as ProductMatch[]) ?? []
}
