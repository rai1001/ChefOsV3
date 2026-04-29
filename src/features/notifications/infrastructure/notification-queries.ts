import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import {
  getNotificationsInputSchema,
  notificationsListSchema,
  type GetNotificationsInput,
} from '../domain/schemas'
import type { Notification } from '../domain/types'

export async function fetchNotifications(
  supabase: SupabaseClient,
  input: GetNotificationsInput
): Promise<Notification[]> {
  const parsed = getNotificationsInputSchema.parse(input)
  const { data, error } = await supabase.rpc('v3_get_notifications', {
    p_hotel_id: parsed.hotel_id,
    p_unread_only: parsed.unread_only ?? false,
    p_limit: parsed.limit ?? 50,
  })

  if (error) throw mapSupabaseError(error, { resource: 'notification' })
  return notificationsListSchema.parse(data ?? [])
}

export async function fetchUnreadNotificationsCount(
  supabase: SupabaseClient,
  hotelId: string
): Promise<number> {
  const { data, error } = await supabase.rpc('v3_get_unread_notifications_count', {
    p_hotel_id: hotelId,
  })

  if (error) throw mapSupabaseError(error, { resource: 'notification' })
  return typeof data === 'number' ? data : 0
}
