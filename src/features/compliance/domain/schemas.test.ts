import { describe, expect, it } from 'vitest'
import {
  cleaningAreaInputSchema,
  complianceOverviewSchema,
  equipmentInputSchema,
  equipmentTypeSchema,
  qualityCheckRpcResultSchema,
} from './schemas'

const hotelId = '11111111-1111-4111-8111-111111111111'
const id = '22222222-2222-4222-8222-222222222222'

describe('compliance schemas', () => {
  it('usa solo los tipos de equipo aplicados en DB', () => {
    expect(equipmentTypeSchema.parse('fridge')).toBe('fridge')
    expect(equipmentTypeSchema.parse('freezer')).toBe('freezer')
    expect(equipmentTypeSchema.safeParse('other').success).toBe(false)
  })

  it('rechaza equipos con nombre vacío o rango invertido', () => {
    expect(() =>
      equipmentInputSchema.parse({
        hotel_id: hotelId,
        name: '  ',
        equipment_type: 'fridge',
        min_temperature_c: 4,
        max_temperature_c: 2,
      })
    ).toThrow()
  })

  it('normaliza áreas de limpieza y valida frecuencia real', () => {
    const parsed = cleaningAreaInputSchema.parse({
      hotel_id: hotelId,
      name: '  Cámara fría  ',
      frequency: 'weekly',
      description: '',
    })

    expect(parsed.name).toBe('Cámara fría')
    expect(parsed.description).toBeNull()
    expect(cleaningAreaInputSchema.safeParse({
      hotel_id: hotelId,
      name: 'Zona',
      frequency: 'quarterly',
    }).success).toBe(false)
  })

  it('parsea overview APPCC con pendientes calculados', () => {
    const overview = complianceOverviewSchema.parse({
      quality: {
        pending_goods_receipts: 2,
        failed_checks_30d: 1,
        latest_failed: [
          {
            id,
            goods_receipt_id: id,
            checked_at: '2026-04-27T10:00:00.000Z',
            temperature_ok: false,
            packaging_ok: true,
            expiry_ok: true,
          },
        ],
      },
      temperature: {
        equipment_active: 3,
        out_of_range_24h: 1,
        latest_out_of_range: [],
      },
      cleaning: {
        areas_active: 4,
        completed_due: 3,
        pending_due: 1,
        pending: [
          {
            area_id: id,
            area_name: 'Plancha',
            frequency: 'daily',
            due_date: '2026-04-27',
          },
        ],
      },
    })

    expect(overview.cleaning.pending[0]?.frequency).toBe('daily')
  })

  it('parsea el wrapper jsonb de quality_check con all_ok computed', () => {
    const result = qualityCheckRpcResultSchema.parse({
      row: {
        id,
        hotel_id: hotelId,
        goods_receipt_id: id,
        temperature_c: 3.5,
        temperature_ok: true,
        packaging_ok: true,
        expiry_ok: true,
        all_ok: true,
        notes: null,
        checked_by: id,
        checked_at: '2026-04-27T10:00:00.000Z',
        created_at: '2026-04-27T10:00:00.000Z',
        updated_at: '2026-04-27T10:00:00.000Z',
      },
    })

    expect(result.row.all_ok).toBe(true)
  })
})
