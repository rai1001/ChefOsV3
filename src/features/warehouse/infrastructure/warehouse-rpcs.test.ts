import { describe, expect, it, vi } from 'vitest'
import {
  TransferQuantityExceededError,
  WarehouseHasActiveStockError,
} from '../domain/errors'
import {
  archiveWarehouse,
  createWarehouse,
  getStockByWarehouse,
  setDefaultWarehouse,
  transferLotQuantity,
} from './warehouse-rpcs'

const hotelId = '11111111-1111-4111-8111-111111111111'
const warehouseId = '22222222-2222-4222-8222-222222222222'
const lotId = '33333333-3333-4333-8333-333333333333'
const productId = '44444444-4444-4444-8444-444444444444'

describe('warehouse RPC adapters', () => {
  it('crea almacén mediante v3_create_warehouse', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: { warehouse_id: warehouseId, id: warehouseId },
        error: null,
      }),
    }

    const result = await createWarehouse(supabase as never, {
      hotel_id: hotelId,
      name: 'Catering eventos',
      warehouse_type: 'catering',
      notes: null,
    })

    expect(supabase.rpc).toHaveBeenCalledWith('v3_create_warehouse', {
      p_hotel_id: hotelId,
      p_name: 'Catering eventos',
      p_warehouse_type: 'catering',
      p_notes: null,
    })
    expect(result.warehouse_id).toBe(warehouseId)
  })

  it('set default usa RPC dedicada', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: { warehouse_id: warehouseId, is_default: true },
        error: null,
      }),
    }

    await setDefaultWarehouse(supabase as never, {
      hotel_id: hotelId,
      warehouse_id: warehouseId,
    })

    expect(supabase.rpc).toHaveBeenCalledWith('v3_set_default_warehouse', {
      p_hotel_id: hotelId,
      p_warehouse_id: warehouseId,
    })
  })

  it('mapea P0011 de archive a WarehouseHasActiveStockError', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'P0011', message: 'warehouse has active inventory' },
      }),
    }

    await expect(
      archiveWarehouse(supabase as never, {
        hotel_id: hotelId,
        warehouse_id: warehouseId,
      })
    ).rejects.toBeInstanceOf(WarehouseHasActiveStockError)
  })

  it('transfiere cantidad de lote con destino y notas', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: {
          from_movement_id: '55555555-5555-4555-8555-555555555555',
          to_movement_id: '66666666-6666-4666-8666-666666666666',
          new_lot_id: '77777777-7777-4777-8777-777777777777',
        },
        error: null,
      }),
    }

    const result = await transferLotQuantity(supabase as never, {
      hotel_id: hotelId,
      lot_id: lotId,
      to_warehouse_id: warehouseId,
      quantity: 3,
      notes: 'Mover a cocina fría',
    })

    expect(supabase.rpc).toHaveBeenCalledWith('v3_transfer_lot_quantity', {
      p_hotel_id: hotelId,
      p_lot_id: lotId,
      p_to_warehouse_id: warehouseId,
      p_quantity: 3,
      p_notes: 'Mover a cocina fría',
    })
    expect(result.new_lot_id).toBe('77777777-7777-4777-8777-777777777777')
  })

  it('mapea P0002 de transferencia a TransferQuantityExceededError', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'P0002', message: 'transfer quantity exceeds available stock' },
      }),
    }

    await expect(
      transferLotQuantity(supabase as never, {
        hotel_id: hotelId,
        lot_id: lotId,
        to_warehouse_id: warehouseId,
        quantity: 99,
      })
    ).rejects.toBeInstanceOf(TransferQuantityExceededError)
  })

  it('lee stock por almacén con producto opcional', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: [
          {
            warehouse_id: warehouseId,
            warehouse_name: 'Economato seco',
            product_id: productId,
            product_name: 'Harina',
            unit_id: '88888888-8888-4888-8888-888888888888',
            unit_abbreviation: 'kg',
            quantity_remaining: 7,
            unit_cost_avg: 1.42,
          },
        ],
        error: null,
      }),
    }

    const result = await getStockByWarehouse(supabase as never, {
      hotel_id: hotelId,
      product_id: productId,
    })

    expect(supabase.rpc).toHaveBeenCalledWith('v3_get_stock_by_warehouse', {
      p_hotel_id: hotelId,
      p_product_id: productId,
    })
    expect(result[0]?.warehouse_name).toBe('Economato seco')
  })
})
