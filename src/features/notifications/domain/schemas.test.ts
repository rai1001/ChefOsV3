import { describe, expect, it } from 'vitest'
import {
  getNotificationsInputSchema,
  notificationPreferenceMapSchema,
  notificationSchema,
  upsertNotificationPreferenceSchema,
} from './schemas'

const baseNotification = {
  id: '11111111-1111-4111-8111-111111111111',
  hotel_id: '22222222-2222-4222-8222-222222222222',
  user_id: '33333333-3333-4333-8333-333333333333',
  event_id: '44444444-4444-4444-8444-444444444444',
  category: 'compliance',
  event_type: 'temperature.out_of_range',
  severity: 'critical',
  title: 'Temperatura fuera de rango',
  body: 'Equipo EQ-1 registró 12°C',
  payload: { equipment_id: 'EQ-1' },
  link: '/compliance/temperature',
  read_at: null,
  created_at: '2026-04-29T10:00:00.000Z',
}

describe('notificationSchema', () => {
  it('parsea una notificación válida', () => {
    const parsed = notificationSchema.parse(baseNotification)
    expect(parsed.severity).toBe('critical')
    expect(parsed.read_at).toBeNull()
  })

  it('acepta event_id null (cascade ON DELETE SET NULL)', () => {
    const parsed = notificationSchema.parse({ ...baseNotification, event_id: null })
    expect(parsed.event_id).toBeNull()
  })

  it('rechaza categoría desconocida', () => {
    expect(() =>
      notificationSchema.parse({ ...baseNotification, category: 'unknown' })
    ).toThrow()
  })

  it('rechaza severity fuera del enum', () => {
    expect(() =>
      notificationSchema.parse({ ...baseNotification, severity: 'fatal' })
    ).toThrow()
  })

  it('payload por defecto es objeto vacío', () => {
    const { payload, ...withoutPayload } = baseNotification
    void payload
    const parsed = notificationSchema.parse(withoutPayload)
    expect(parsed.payload).toEqual({})
  })
})

describe('notificationPreferenceMapSchema', () => {
  it('exige las 5 categorías como booleans', () => {
    const parsed = notificationPreferenceMapSchema.parse({
      compliance: true,
      inventory: false,
      production: true,
      procurement: true,
      system: true,
    })
    expect(parsed.inventory).toBe(false)
  })

  it('falla si falta una categoría', () => {
    expect(() =>
      notificationPreferenceMapSchema.parse({
        compliance: true,
        inventory: true,
        production: true,
        procurement: true,
      })
    ).toThrow()
  })
})

describe('upsertNotificationPreferenceSchema', () => {
  it('rechaza category fuera del enum', () => {
    expect(() =>
      upsertNotificationPreferenceSchema.parse({
        hotel_id: baseNotification.hotel_id,
        category: 'finance',
        in_app_enabled: true,
      })
    ).toThrow()
  })
})

describe('getNotificationsInputSchema', () => {
  it('limit > 200 falla', () => {
    expect(() =>
      getNotificationsInputSchema.parse({
        hotel_id: baseNotification.hotel_id,
        limit: 500,
      })
    ).toThrow()
  })
})
