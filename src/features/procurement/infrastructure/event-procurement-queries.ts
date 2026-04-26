import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import type { GenerateEventPurchaseRequestsResult } from '../domain/types'

export async function generatePurchaseRequestsForEvent(
  supabase: SupabaseClient,
  hotelId: string,
  eventId: string
): Promise<GenerateEventPurchaseRequestsResult> {
  const { data, error } = await supabase.rpc('v3_generate_purchase_requests_for_event', {
    p_hotel_id: hotelId,
    p_event_id: eventId,
  })

  if (error) throw mapSupabaseError(error, { resource: 'event_purchase_requests' })
  return data as GenerateEventPurchaseRequestsResult
}
