import { describe, expect, it } from 'vitest'
import {
  createWarehouseSchema,
  transferLotSchema,
  updateWarehouseSchema,
} from './schemas'

const hotelId = '11111111-1111-4111-8111-111111111111'
const warehouseId = '22222222-2222-4222-8222-222222222222'
const lotId = '33333333-3333-4333-8333-333333333333'

describe('warehouse schemas', () => {
  it('valida creación de almacén con tipo permitido', () => {
    const parsed = createWarehouseSchema.parse({
      hotel_id: hotelId,
      name: 'Congelador central',
      warehouse_type: 'frozen',
      notes: 'Eurostars producción',
    })

    expect(parsed.warehouse_type).toBe('frozen')
  })

  it('rechaza nombres demasiado cortos', () => {
    const result = createWarehouseSchema.safeParse({
      hotel_id: hotelId,
      name: 'A',
      warehouse_type: 'main',
    })

    expect(result.success).toBe(false)
  })

  it('normaliza payload de actualización sin permitir is_default', () => {
    const parsed = updateWarehouseSchema.parse({
      hotel_id: hotelId,
      warehouse_id: warehouseId,
      name: 'Cocina fría',
      warehouse_type: 'cold',
      is_active: true,
      notes: null,
    })

    expect(parsed).not.toHaveProperty('is_default')
  })

  it('valida transferencias con cantidad positiva', () => {
    const parsed = transferLotSchema.parse({
      hotel_id: hotelId,
      lot_id: lotId,
      to_warehouse_id: warehouseId,
      quantity: '3.5',
      notes: '',
    })

    expect(parsed.quantity).toBe(3.5)
  })
})
