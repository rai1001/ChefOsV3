import { describe, expect, it, vi } from 'vitest'
import { ForbiddenError } from '@/lib/errors'
import {
  ComplianceNotFoundError,
  ComplianceValidationError,
} from '../domain/errors'
import {
  completeCleaningCheck,
  fetchComplianceOverview,
  logEquipmentTemperature,
  recordGoodsReceiptQualityCheck,
  traceLot,
} from './compliance-rpcs'

const hotelId = '11111111-1111-4111-8111-111111111111'
const id = '22222222-2222-4222-8222-222222222222'

function qualityRow() {
  return {
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
  }
}

describe('compliance RPC adapters', () => {
  it('llama la RPC real de quality_check y nunca el nombre antiguo', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: { row: qualityRow() },
        error: null,
      }),
    }

    const result = await recordGoodsReceiptQualityCheck(supabase as never, {
      hotel_id: hotelId,
      goods_receipt_id: id,
      temperature_c: 3.5,
      temperature_ok: true,
      packaging_ok: true,
      expiry_ok: true,
      notes: 'OK',
    })

    expect(supabase.rpc).toHaveBeenCalledWith('v3_record_goods_receipt_quality_check', {
      p_hotel_id: hotelId,
      p_goods_receipt_id: id,
      p_temperature_c: 3.5,
      p_temperature_ok: true,
      p_packaging_ok: true,
      p_expiry_ok: true,
      p_notes: 'OK',
    })
    expect(supabase.rpc).not.toHaveBeenCalledWith('v3_create_quality_check', expect.anything())
    expect(result.row.goods_receipt_id).toBe(id)
  })

  it('mapea P0003 de temperatura a ComplianceValidationError', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'P0003', message: 'temperature required' },
      }),
    }

    await expect(
      logEquipmentTemperature(supabase as never, {
        hotel_id: hotelId,
        equipment_id: id,
        temperature_c: 0,
      })
    ).rejects.toBeInstanceOf(ComplianceValidationError)
  })

  it('mapea P0010 a ComplianceNotFoundError', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'P0010', message: 'lot not found' },
      }),
    }

    await expect(traceLot(supabase as never, { hotel_id: hotelId, lot_id: id }))
      .rejects.toBeInstanceOf(ComplianceNotFoundError)
  })

  it('delega P0001 membership al mapper transversal', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'P0001', status: 403, message: 'membership required' },
      }),
    }

    await expect(fetchComplianceOverview(supabase as never, hotelId))
      .rejects.toBeInstanceOf(ForbiddenError)
  })

  it('llama complete_cleaning_check con due_date opcional y parsea contexto de área', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: {
          row: {
            id,
            hotel_id: hotelId,
            area_id: id,
            due_date: '2026-04-27',
            completed_at: '2026-04-27T10:00:00.000Z',
            completed_by: id,
            notes: null,
            created_at: '2026-04-27T10:00:00.000Z',
            updated_at: '2026-04-27T10:00:00.000Z',
          },
          area_name: 'Cocina fría',
          frequency: 'daily',
        },
        error: null,
      }),
    }

    const result = await completeCleaningCheck(supabase as never, {
      hotel_id: hotelId,
      area_id: id,
      due_date: '2026-04-27',
      notes: null,
    })

    expect(supabase.rpc).toHaveBeenCalledWith('v3_complete_cleaning_check', {
      p_hotel_id: hotelId,
      p_area_id: id,
      p_due_date: '2026-04-27',
      p_notes: null,
    })
    expect(result.area_name).toBe('Cocina fría')
  })
})
