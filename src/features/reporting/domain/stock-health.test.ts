import { describe, expect, it } from 'vitest'
import { stockHealthReportSchema } from './stock-health'

const productId = '11111111-1111-4111-8111-111111111111'
const categoryId = '22222222-2222-4222-8222-222222222222'
const lotId = '33333333-3333-4333-8333-333333333333'
const unitId = '44444444-4444-4444-8444-444444444444'
const orderId = '55555555-5555-4555-8555-555555555555'

describe('stock health schema', () => {
  it('parsea summary, caducidades y stock muerto', () => {
    const report = stockHealthReportSchema.parse({
      summary: {
        total_products_with_stock: 3,
        total_qty_on_hand: 12.5,
        total_stock_value: 48.25,
        total_lots_active: 4,
        total_preparation_lots_active: 1,
      },
      expiring_soon: [
        {
          lot_id: lotId,
          product_id: productId,
          product_name: 'Fondo blanco',
          category_id: categoryId,
          quantity_remaining: 1,
          unit_id: unitId,
          unit_name: 'kilogramo',
          unit_abbreviation: 'kg',
          unit_cost: 2,
          stock_value: 2,
          received_at: '2026-04-27T08:00:00.000Z',
          expires_at: '2026-04-30T00:00:00.000Z',
          days_to_expiry: 3,
          is_preparation: true,
          production_order_id: orderId,
        },
      ],
      dead_stock: [
        {
          product_id: productId,
          product_name: 'Fondo blanco',
          category_id: categoryId,
          qty_on_hand: 1,
          stock_value: 2,
          lots_count: 1,
          last_consumed_at: null,
        },
      ],
    })

    expect(report.summary.total_stock_value).toBe(48.25)
    expect(report.expiring_soon[0]?.is_preparation).toBe(true)
    expect(report.dead_stock[0]?.last_consumed_at).toBeNull()
  })
})
