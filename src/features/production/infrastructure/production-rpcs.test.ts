import { describe, expect, it, vi } from 'vitest'
import {
  checkProductionFeasibility,
  createProductionOrder,
  startProduction,
} from './production-rpcs'

const hotelId = '22222222-2222-4222-8222-222222222222'
const recipeId = '33333333-3333-4333-8333-333333333333'
const orderId = '44444444-4444-4444-8444-444444444444'
const warehouseId = '99999999-9999-4999-8999-999999999999'

describe('production RPC adapters', () => {
  it('crea orden de producción con snapshot de líneas', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: {
          order_id: orderId,
          total_estimated_cost: 27.5,
          lines: [
            {
              id: '55555555-5555-4555-8555-555555555555',
              hotel_id: hotelId,
              production_order_id: orderId,
              product_id: '66666666-6666-4666-8666-666666666666',
              source_recipe_id: null,
              quantity_required: 12.5,
              unit_id: '77777777-7777-4777-8777-777777777777',
              estimated_unit_cost: 2.2,
              estimated_total_cost: 27.5,
              actual_consumed_quantity: null,
              actual_total_cost: null,
              weighted_unit_cost: null,
              created_at: '2026-04-27T10:00:00.000Z',
            },
          ],
          subrecipe_chain: [],
        },
        error: null,
      }),
    }

    const result = await createProductionOrder(supabase as never, {
      hotel_id: hotelId,
      recipe_id: recipeId,
      servings: 80,
      scheduled_at: '2026-04-28T08:00:00.000Z',
      notes: 'Menú diario lunes',
    })

    expect(supabase.rpc).toHaveBeenCalledWith('v3_create_production_order', {
      p_hotel_id: hotelId,
      p_recipe_id: recipeId,
      p_servings: 80,
      p_scheduled_at: '2026-04-28T08:00:00.000Z',
      p_notes: 'Menú diario lunes',
    })
    expect(result.order_id).toBe(orderId)
  })

  it('parsea feasibility con déficits', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: {
          feasible: false,
          deficits: [
            {
              product_id: '66666666-6666-4666-8666-666666666666',
              required: 12.5,
              available: 5,
              missing: 7.5,
            },
          ],
        },
        error: null,
      }),
    }

    const result = await checkProductionFeasibility(supabase as never, {
      hotel_id: hotelId,
      production_order_id: orderId,
      warehouse_id: warehouseId,
    })

    expect(supabase.rpc).toHaveBeenCalledWith('v3_check_production_feasibility', {
      p_hotel_id: hotelId,
      p_production_order_id: orderId,
      p_warehouse_id: warehouseId,
    })
    expect(result.feasible).toBe(false)
    expect(result.deficits[0]?.missing).toBe(7.5)
  })

  it('mapea P0002 jerárquico de start_production a ProductionInsufficientStockError', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: {
          code: 'P0002',
          message: 'insufficient stock for production order',
          details: JSON.stringify({
            feasible: false,
            deficits: [
              {
                product_id: '66666666-6666-4666-8666-666666666666',
                required: 12.5,
                available: 5,
                missing: 7.5,
              },
            ],
            subrecipe_chain: [
              {
                depth: 1,
                parent_recipe_id: recipeId,
                recipe_id: '77777777-7777-4777-8777-777777777777',
                product_id: '88888888-8888-4888-8888-888888888888',
                unit_id: '99999999-9999-4999-8999-999999999999',
                required: 0.6,
                available: 0,
                missing: 0.6,
                output_quantity_per_batch: 1,
                batches_needed: 1,
                target_servings: 8,
                quantity_to_produce: 1,
                will_produce: true,
              },
            ],
          }),
        },
      }),
    }

    await expect(
      startProduction(supabase as never, {
        hotel_id: hotelId,
        production_order_id: orderId,
      })
    ).rejects.toMatchObject({
      deficits: [
        {
          product_id: '66666666-6666-4666-8666-666666666666',
          missing: 7.5,
        },
      ],
      feasibility: {
        subrecipe_chain: [
          {
            recipe_id: '77777777-7777-4777-8777-777777777777',
            will_produce: true,
          },
        ],
      },
    })
  })

  it('envía warehouse_id opcional al iniciar producción', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: {
          order: {
            id: orderId,
            hotel_id: hotelId,
            recipe_id: recipeId,
            recipe_name: 'Fondo oscuro',
            servings: 80,
            status: 'in_progress',
            scheduled_at: null,
            started_at: '2026-04-28T10:00:00.000Z',
            completed_at: null,
            cancelled_at: null,
            cancellation_reason: null,
            estimated_total_cost: 12,
            actual_total_cost: 10,
            notes: null,
            created_by: null,
            created_at: '2026-04-28T09:00:00.000Z',
            updated_at: '2026-04-28T10:00:00.000Z',
          },
          lines: [],
          movements: [],
          subrecipe_productions: [],
        },
        error: null,
      }),
    }

    await startProduction(supabase as never, {
      hotel_id: hotelId,
      production_order_id: orderId,
      warehouse_id: warehouseId,
    })

    expect(supabase.rpc).toHaveBeenCalledWith('v3_start_production', {
      p_hotel_id: hotelId,
      p_production_order_id: orderId,
      p_warehouse_id: warehouseId,
    })
  })
})
