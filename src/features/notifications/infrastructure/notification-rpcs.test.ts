import { describe, expect, it, vi } from 'vitest'
import { NotificationNotFoundError } from '../domain/errors'
import {
  getNotificationPreferences,
  markAllNotificationsRead,
  markNotificationRead,
  upsertNotificationPreference,
} from './notification-rpcs'

const hotelId = '11111111-1111-4111-8111-111111111111'
const notificationId = '22222222-2222-4222-8222-222222222222'

const baseNotification = {
  id: notificationId,
  hotel_id: hotelId,
  user_id: '33333333-3333-4333-8333-333333333333',
  event_id: null,
  category: 'compliance',
  event_type: 'temperature.out_of_range',
  severity: 'critical',
  title: 'Temperatura fuera de rango',
  body: 'Equipo EQ-1 registró 12°C',
  payload: {},
  link: '/compliance/temperature',
  read_at: '2026-04-29T10:00:00.000Z',
  created_at: '2026-04-29T09:00:00.000Z',
}

describe('notification RPC adapters', () => {
  it('markNotificationRead llama RPC con args correctos', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({ data: baseNotification, error: null }),
    }

    const result = await markNotificationRead(supabase as never, {
      hotel_id: hotelId,
      notification_id: notificationId,
    })

    expect(supabase.rpc).toHaveBeenCalledWith('v3_mark_notification_read', {
      p_hotel_id: hotelId,
      p_notification_id: notificationId,
    })
    expect(result.id).toBe(notificationId)
    expect(result.read_at).toBe('2026-04-29T10:00:00.000Z')
  })

  it('markNotificationRead mapea P0010 a NotificationNotFoundError', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'P0010', message: 'notification not found' },
      }),
    }

    await expect(
      markNotificationRead(supabase as never, {
        hotel_id: hotelId,
        notification_id: notificationId,
      })
    ).rejects.toBeInstanceOf(NotificationNotFoundError)
  })

  it('markAllNotificationsRead devuelve count numérico', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({ data: 7, error: null }),
    }

    const count = await markAllNotificationsRead(supabase as never, {
      hotel_id: hotelId,
    })

    expect(supabase.rpc).toHaveBeenCalledWith('v3_mark_all_notifications_read', {
      p_hotel_id: hotelId,
    })
    expect(count).toBe(7)
  })

  it('getNotificationPreferences valida con notificationPreferenceMapSchema', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: {
          compliance: true,
          inventory: false,
          production: true,
          procurement: true,
          system: true,
        },
        error: null,
      }),
    }

    const prefs = await getNotificationPreferences(supabase as never, hotelId)
    expect(prefs.inventory).toBe(false)
  })

  it('upsertNotificationPreference llama RPC con args y devuelve data', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: { hotel_id: hotelId, category: 'compliance', in_app_enabled: false },
        error: null,
      }),
    }

    const result = await upsertNotificationPreference(supabase as never, {
      hotel_id: hotelId,
      category: 'compliance',
      in_app_enabled: false,
    })

    expect(supabase.rpc).toHaveBeenCalledWith('v3_upsert_notification_preference', {
      p_hotel_id: hotelId,
      p_category: 'compliance',
      p_in_app_enabled: false,
    })
    expect(result.in_app_enabled).toBe(false)
  })
})
