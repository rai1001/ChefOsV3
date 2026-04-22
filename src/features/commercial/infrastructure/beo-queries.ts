import type { SupabaseClient } from '@supabase/supabase-js'
import type { BeoData } from '../domain/types'
import { EventNotFoundError } from '../domain/errors'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'

export async function fetchEventBeo(
  supabase: SupabaseClient,
  hotelId: string,
  eventId: string
): Promise<BeoData> {
  const { data, error } = await supabase.rpc('get_event_beo', {
    p_hotel_id: hotelId,
    p_event_id: eventId,
  })
  if (error) throw mapSupabaseError(error, { resource: 'event_beo' })
  if (!data) throw new EventNotFoundError(eventId, `BEO no disponible para evento ${eventId}`)
  return data as BeoData
}

export async function calculateEventCostEstimate(
  supabase: SupabaseClient,
  hotelId: string,
  eventId: string
): Promise<number> {
  const { data, error } = await supabase.rpc('calculate_event_cost_estimate', {
    p_hotel_id: hotelId,
    p_event_id: eventId,
  })
  if (error) throw mapSupabaseError(error, { resource: 'event_cost_estimate' })
  return typeof data === 'number' ? data : Number(data ?? 0)
}

export async function generateEventOperationalImpact(
  supabase: SupabaseClient,
  hotelId: string,
  eventId: string
): Promise<number> {
  const { data, error } = await supabase.rpc('generate_event_operational_impact', {
    p_hotel_id: hotelId,
    p_event_id: eventId,
  })
  if (error) throw mapSupabaseError(error, { resource: 'event_operational_impact' })
  return typeof data === 'number' ? data : Number(data ?? 0)
}
