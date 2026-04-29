import { createClient } from '@/lib/supabase/server'
import {
  fetchNotifications,
  fetchUnreadNotificationsCount,
} from '../infrastructure/notification-queries'
import { getNotificationPreferences } from '../infrastructure/notification-rpcs'
import type { NotificationListFilter } from '../domain/types'

export async function getNotificationsServer(filter: NotificationListFilter) {
  const supabase = await createClient()
  return fetchNotifications(supabase, {
    hotel_id: filter.hotelId,
    unread_only: filter.unreadOnly,
    limit: filter.limit,
  })
}

export async function getUnreadNotificationsCountServer(hotelId: string) {
  const supabase = await createClient()
  return fetchUnreadNotificationsCount(supabase, hotelId)
}

export async function getNotificationPreferencesServer(hotelId: string) {
  const supabase = await createClient()
  return getNotificationPreferences(supabase, hotelId)
}
