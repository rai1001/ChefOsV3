import { z } from 'zod'
import { uuidString } from '@/lib/zod/uuid-string'
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_SEVERITIES,
} from './types'

export const notificationSchema = z.object({
  id: uuidString(),
  hotel_id: uuidString(),
  user_id: uuidString(),
  event_id: uuidString().nullable(),
  category: z.enum(NOTIFICATION_CATEGORIES),
  event_type: z.string().min(1),
  severity: z.enum(NOTIFICATION_SEVERITIES),
  title: z.string().min(1),
  body: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).default({}),
  link: z.string().nullable(),
  read_at: z.string().nullable(),
  created_at: z.string().min(1),
})

export const notificationsListSchema = z.array(notificationSchema)

export const notificationPreferenceMapSchema = z.object({
  compliance: z.boolean(),
  inventory: z.boolean(),
  production: z.boolean(),
  procurement: z.boolean(),
  system: z.boolean(),
})

export const getNotificationsInputSchema = z.object({
  hotel_id: uuidString(),
  unread_only: z.boolean().optional(),
  limit: z.number().int().min(1).max(200).optional(),
})

export const markNotificationReadInputSchema = z.object({
  hotel_id: uuidString(),
  notification_id: uuidString(),
})

export const markAllNotificationsReadInputSchema = z.object({
  hotel_id: uuidString(),
})

export const upsertNotificationPreferenceSchema = z.object({
  hotel_id: uuidString(),
  category: z.enum(NOTIFICATION_CATEGORIES),
  in_app_enabled: z.boolean(),
})

export type GetNotificationsInput = z.input<typeof getNotificationsInputSchema>
export type MarkNotificationReadInput = z.input<typeof markNotificationReadInputSchema>
export type MarkAllNotificationsReadInput = z.input<typeof markAllNotificationsReadInputSchema>
export type UpsertNotificationPreferenceInput = z.input<typeof upsertNotificationPreferenceSchema>
