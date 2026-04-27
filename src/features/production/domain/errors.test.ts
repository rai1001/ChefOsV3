import { describe, expect, it } from 'vitest'
import {
  ProductionInsufficientStockError,
  ProductionInvalidStateError,
  ProductionOrderNotFoundError,
} from './errors'

describe('production domain errors', () => {
  it('ProductionOrderNotFoundError conserva el id de orden', () => {
    const error = new ProductionOrderNotFoundError('order-1')

    expect(error.code).toBe('PRODUCTION_ORDER_NOT_FOUND')
    expect(error.orderId).toBe('order-1')
  })

  it('ProductionInsufficientStockError expone déficits', () => {
    const error = new ProductionInsufficientStockError([
      {
        product_id: '11111111-1111-4111-8111-111111111111',
        required: 10,
        available: 4,
        missing: 6,
      },
    ])

    expect(error.code).toBe('PRODUCTION_INSUFFICIENT_STOCK')
    expect(error.deficits[0]?.missing).toBe(6)
  })

  it('ProductionInvalidStateError describe transición inválida', () => {
    const error = new ProductionInvalidStateError('completed', 'cancelled')

    expect(error.code).toBe('PRODUCTION_INVALID_STATE')
    expect(error.from).toBe('completed')
    expect(error.to).toBe('cancelled')
  })
})
