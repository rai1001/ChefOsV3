import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import {
  NotificationCategoryInvalidError,
  NotificationNotFoundError,
} from '../domain/errors'
import {
  markAllNotificationsReadInputSchema,
  markNotificationReadInputSchema,
  notificationPreferenceMapSchema,
  notificationSchema,
  upsertNotificationPreferenceSchema,
  type MarkAllNotificationsReadInput,
  type MarkNotificationReadInput,
  type UpsertNotificationPreferenceInput,
} from '../domain/schemas'
import type {
  Notification,
  NotificationPreferenceMap,
} from '../domain/types'

interface SupabaseErrorLike {
  code?: string
  message?: string
}

function isErrorLike(error: unknown): error is SupabaseErrorLike {
  return error !== null && typeof error === 'object'
}

function mapNotificationRpcError(error: unknown, notificationId?: string): never {
  if (isErrorLike(error)) {
    const message = error.message ?? ''
    if (error.code === 'P0010') {
      throw new NotificationNotFoundError(notificationId ?? '', message)
    }
    if (error.code === 'P0003') {
      throw new NotificationCategoryInvalidError(message, message)
    }
  }
  throw mapSupabaseError(error, { resource: 'notification' })
}

export async function markNotificationRead(
  supabase: SupabaseClient,
  input: MarkNotificationReadInput
): Promise<Notification> {
  const parsed = markNotificationReadInputSchema.parse(input)
  const { data, error } = await supabase.rpc('v3_mark_notification_read', {
    p_hotel_id: parsed.hotel_id,
    p_notification_id: parsed.notification_id,
  })

  if (error) mapNotificationRpcError(error, parsed.notification_id)
  return notificationSchema.parse(data)
}

export async function markAllNotificationsRead(
  supabase: SupabaseClient,
  input: MarkAllNotificationsReadInput
): Promise<number> {
  const parsed = markAllNotificationsReadInputSchema.parse(input)
  const { data, error } = await supabase.rpc('v3_mark_all_notifications_read', {
    p_hotel_id: parsed.hotel_id,
  })

  if (error) mapNotificationRpcError(error)
  return typeof data === 'number' ? data : 0
}

export async function getNotificationPreferences(
  supabase: SupabaseClient,
  hotelId: string
): Promise<NotificationPreferenceMap> {
  const { data, error } = await supabase.rpc('v3_get_notification_preferences', {
    p_hotel_id: hotelId,
  })

  if (error) mapNotificationRpcError(error)
  return notificationPreferenceMapSchema.parse(data ?? {})
}

export async function upsertNotificationPreference(
  supabase: SupabaseClient,
  input: UpsertNotificationPreferenceInput
): Promise<{ category: string; in_app_enabled: boolean }> {
  const parsed = upsertNotificationPreferenceSchema.parse(input)
  const { data, error } = await supabase.rpc('v3_upsert_notification_preference', {
    p_hotel_id: parsed.hotel_id,
    p_category: parsed.category,
    p_in_app_enabled: parsed.in_app_enabled,
  })

  if (error) mapNotificationRpcError(error)
  if (data === null || typeof data !== 'object') {
    throw new NotificationCategoryInvalidError(parsed.category, 'La RPC no devolvió la preferencia')
  }
  return data as { category: string; in_app_enabled: boolean }
}
