import { describe, expect, it, vi } from 'vitest'
import { ReportInvalidDimensionError } from '../domain/errors'
import {
  fetchFoodCostReport,
  fetchStockHealthReport,
  fetchTopProductsReport,
} from './reporting-rpcs'

const hotelId = '11111111-1111-4111-8111-111111111111'
const recipeId = '22222222-2222-4222-8222-222222222222'
const productId = '33333333-3333-4333-8333-333333333333'
const categoryId = '44444444-4444-4444-8444-444444444444'

describe('reporting RPC adapters', () => {
  it('llama food cost con fechas UTC y parsea filas', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: [
          {
            recipe_id: recipeId,
            recipe_name: 'Menú diario',
            production_orders_count: 2,
            total_servings_produced: 160,
            total_estimated_cost: 300,
            total_actual_cost: 330,
            cost_variance_pct: 10,
            avg_actual_cost_per_serving: 2.0625,
          },
        ],
        error: null,
      }),
    }

    const result = await fetchFoodCostReport(supabase as never, {
      hotelId,
      from: '2026-04-01',
      to: '2026-05-01',
    })

    expect(supabase.rpc).toHaveBeenCalledWith('v3_report_food_cost_by_recipe', {
      p_hotel_id: hotelId,
      p_from: '2026-04-01T00:00:00.000Z',
      p_to: '2026-05-01T00:00:00.000Z',
      p_recipe_id: undefined,
    })
    expect(result[0]?.total_actual_cost).toBe(330)
  })

  it('mapea dimensión inválida a ReportInvalidDimensionError', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: {
          code: 'P0003',
          message: 'invalid reporting dimension',
        },
      }),
    }

    await expect(
      fetchTopProductsReport(supabase as never, {
        hotelId,
        from: '2026-04-01',
        to: '2026-05-01',
        dimension: 'consumed_value',
        limit: 20,
      })
    ).rejects.toBeInstanceOf(ReportInvalidDimensionError)
  })

  it('parsea stock health JSON', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: {
          summary: {
            total_products_with_stock: 1,
            total_qty_on_hand: 4,
            total_stock_value: 20,
            total_lots_active: 1,
            total_preparation_lots_active: 0,
          },
          expiring_soon: [],
          dead_stock: [
            {
              product_id: productId,
              product_name: 'Almendra',
              category_id: categoryId,
              qty_on_hand: 4,
              stock_value: 20,
              lots_count: 1,
              last_consumed_at: null,
            },
          ],
        },
        error: null,
      }),
    }

    const result = await fetchStockHealthReport(supabase as never, hotelId)

    expect(supabase.rpc).toHaveBeenCalledWith('v3_report_stock_health', {
      p_hotel_id: hotelId,
    })
    expect(result.dead_stock[0]?.product_name).toBe('Almendra')
  })
})
