import { describe, expect, it, vi } from 'vitest'
import { InsufficientStockError } from '../domain/errors'
import { consumeInventory } from './inventory-rpcs'

describe('consumeInventory', () => {
  it('mapea P0002 de stock insuficiente a InsufficientStockError', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: {
          code: 'P0002',
          message:
            'insufficient stock for product 33333333-3333-3333-3333-333333333333, requested 100, missing 97.0000',
        },
      }),
    }

    await expect(
      consumeInventory(supabase as never, {
        hotel_id: '22222222-2222-2222-2222-222222222222',
        product_id: '33333333-3333-3333-3333-333333333333',
        quantity: 100,
        origin: { source: 'test' },
      })
    ).rejects.toBeInstanceOf(InsufficientStockError)
  })
})
