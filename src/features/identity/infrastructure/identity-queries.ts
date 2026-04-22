import type { SupabaseClient } from '@supabase/supabase-js'
import type { ActiveHotel, UserHotel } from '../domain/types'
import { NoActiveHotelError } from '../domain/errors'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'

export async function callGetActiveHotel(supabase: SupabaseClient): Promise<ActiveHotel> {
  const { data, error } = await supabase.rpc('get_active_hotel')
  if (error) {
    // RPC get_active_hotel lanza 'no active membership found' con code P0003
    // cuando el usuario no tiene membership. Lo mapeamos al error de dominio.
    if ((error as { code?: string }).code === 'P0003') throw new NoActiveHotelError()
    throw mapSupabaseError(error, { resource: 'active_hotel' })
  }
  if (!data) throw new NoActiveHotelError()
  return data as ActiveHotel
}

export async function callGetUserHotels(supabase: SupabaseClient): Promise<UserHotel[]> {
  const { data, error } = await supabase.rpc('get_user_hotels')
  if (error) throw mapSupabaseError(error, { resource: 'user_hotels' })
  return (data as UserHotel[] | null) ?? []
}

export async function callSwitchActiveHotel(
  supabase: SupabaseClient,
  hotelId: string
): Promise<void> {
  const { error } = await supabase.rpc('switch_active_hotel', { p_hotel_id: hotelId })
  if (error) throw mapSupabaseError(error, { resource: 'active_hotel' })
}
