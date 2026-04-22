import type { SupabaseClient } from '@supabase/supabase-js'
import type { EscandalloLive, EscandalloSyncResult } from '../domain/types'

export async function getEscandalloLive(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string
): Promise<EscandalloLive> {
  const { data, error } = await supabase.rpc('get_escandallo_live', {
    p_hotel_id: hotelId,
    p_recipe_id: recipeId,
  })
  if (error) throw error
  return data as EscandalloLive
}

export async function syncEscandalloPrices(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string
): Promise<EscandalloSyncResult> {
  const { data, error } = await supabase.rpc('sync_escandallo_prices', {
    p_hotel_id: hotelId,
    p_recipe_id: recipeId,
  })
  if (error) throw error
  return data as EscandalloSyncResult
}
