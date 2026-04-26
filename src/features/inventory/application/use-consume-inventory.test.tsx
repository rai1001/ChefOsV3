import React from 'react'
import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createClient } from '@/lib/supabase/client'
import { consumeInventory } from '../infrastructure/inventory-rpcs'
import { useConsumeInventory } from './use-consume-inventory'

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

vi.mock('../infrastructure/inventory-rpcs', () => ({
  consumeInventory: vi.fn(),
}))

describe('useConsumeInventory', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
      },
    })
    vi.spyOn(queryClient, 'invalidateQueries')
  })

  function wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  it('consume FIFO e invalida snapshot, lotes, movimientos y escandallos', async () => {
    const supabase = {}
    vi.mocked(createClient).mockReturnValue(supabase as ReturnType<typeof createClient>)
    vi.mocked(consumeInventory).mockResolvedValue({
      product_id: 'product-1',
      quantity: 7,
      consumed_lots: [
        { lot_id: 'lot-a', quantity: 5, unit_cost: 10, total_cost: 50 },
        { lot_id: 'lot-b', quantity: 2, unit_cost: 12, total_cost: 24 },
      ],
      total_cost: 74,
      weighted_unit_cost: 10.5714,
    })

    const { result } = renderHook(() => useConsumeInventory(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        hotel_id: 'hotel-1',
        product_id: 'product-1',
        quantity: 7,
        origin: { source: 'manual' },
      })
    })

    expect(consumeInventory).toHaveBeenCalledWith(supabase, {
      hotel_id: 'hotel-1',
      product_id: 'product-1',
      quantity: 7,
      origin: { source: 'manual' },
    })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['inventory', 'snapshot'],
    })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['inventory', 'lots', 'hotel-1', 'product-1'],
    })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['inventory', 'movements', 'hotel-1', 'product-1'],
    })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['escandallos'],
    })
  })
})
