import type { SupabaseClient } from '@supabase/supabase-js'
import type { EscandalloLive, EscandalloSyncResult } from '../domain/types'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'

export async function getEscandalloLive(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string
): Promise<EscandalloLive> {
  const { data, error } = await supabase.rpc('v3_get_escandallo_live', {
    p_hotel_id: hotelId,
    p_recipe_id: recipeId,
  })
  if (error) throw mapSupabaseError(error, { resource: 'escandallo' })
  return data as EscandalloLive
}

export async function syncEscandalloPrices(
  supabase: SupabaseClient,
  hotelId: string,
  recipeId: string
): Promise<EscandalloSyncResult> {
  const { data, error } = await supabase.rpc('v3_sync_escandallo_prices', {
    p_hotel_id: hotelId,
    p_recipe_id: recipeId,
  })
  if (error) throw mapSupabaseError(error, { resource: 'escandallo' })
  return data as EscandalloSyncResult
}
