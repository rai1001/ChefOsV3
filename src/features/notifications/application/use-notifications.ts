'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  fetchNotifications,
  fetchUnreadNotificationsCount,
} from '../infrastructure/notification-queries'
import {
  getNotificationPreferences,
  markAllNotificationsRead,
  markNotificationRead,
  upsertNotificationPreference,
} from '../infrastructure/notification-rpcs'
import type {
  MarkAllNotificationsReadInput,
  MarkNotificationReadInput,
  UpsertNotificationPreferenceInput,
} from '../domain/schemas'
import type {
  Notification,
  NotificationListFilter,
  NotificationPreferenceMap,
} from '../domain/types'

export const NOTIFICATION_QUERY_KEYS = {
  list: (filter: NotificationListFilter | undefined) =>
    ['notifications', 'list', filter] as const,
  unreadCount: (hotelId: string | undefined) =>
    ['notifications', 'unread-count', hotelId] as const,
  preferences: (hotelId: string | undefined) =>
    ['notifications', 'preferences', hotelId] as const,
}

const UNREAD_COUNT_POLL_MS = 60_000

export function useNotifications(filter: NotificationListFilter | undefined) {
  return useQuery<Notification[]>({
    queryKey: NOTIFICATION_QUERY_KEYS.list(filter),
    enabled: !!filter?.hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchNotifications(supabase, {
        hotel_id: filter!.hotelId,
        unread_only: filter!.unreadOnly,
        limit: filter!.limit,
      })
    },
  })
}

export function useUnreadNotificationsCount(hotelId: string | undefined) {
  return useQuery<number>({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount(hotelId),
    enabled: !!hotelId,
    refetchInterval: UNREAD_COUNT_POLL_MS,
    refetchIntervalInBackground: false,
    queryFn: async () => {
      const supabase = createClient()
      return fetchUnreadNotificationsCount(supabase, hotelId!)
    },
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: MarkNotificationReadInput) => {
      const supabase = createClient()
      return markNotificationRead(supabase, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: MarkAllNotificationsReadInput) => {
      const supabase = createClient()
      return markAllNotificationsRead(supabase, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useNotificationPreferences(hotelId: string | undefined) {
  return useQuery<NotificationPreferenceMap>({
    queryKey: NOTIFICATION_QUERY_KEYS.preferences(hotelId),
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return getNotificationPreferences(supabase, hotelId!)
    },
  })
}

export function useUpsertNotificationPreference() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpsertNotificationPreferenceInput) => {
      const supabase = createClient()
      return upsertNotificationPreference(supabase, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
