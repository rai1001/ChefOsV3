import React from 'react'
import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createClient } from '@/lib/supabase/client'
import { ProductionInsufficientStockError } from '../domain/errors'
import { startProduction } from '../infrastructure/production-rpcs'
import { useStartProduction } from './use-start-production'

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

vi.mock('../infrastructure/production-rpcs', () => ({
  startProduction: vi.fn(),
}))

const hotelId = '22222222-2222-4222-8222-222222222222'
const orderId = '44444444-4444-4444-8444-444444444444'

describe('useStartProduction', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    })
    vi.spyOn(queryClient, 'invalidateQueries')
  })

  function wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  it('inicia producción e invalida listado y detalle', async () => {
    const supabase = {}
    vi.mocked(createClient).mockReturnValue(supabase as ReturnType<typeof createClient>)
    vi.mocked(startProduction).mockResolvedValue({
      order: {
        id: orderId,
        hotel_id: hotelId,
        recipe_id: '33333333-3333-4333-8333-333333333333',
        recipe_name: 'Crema de calabaza',
        servings: 80,
        status: 'in_progress',
        scheduled_at: null,
        started_at: '2026-04-27T10:00:00.000Z',
        completed_at: null,
        cancelled_at: null,
        cancellation_reason: null,
        estimated_total_cost: 27.5,
        actual_total_cost: 26.8,
        notes: null,
        created_by: null,
        created_at: '2026-04-27T09:00:00.000Z',
        updated_at: '2026-04-27T10:00:00.000Z',
      },
      lines: [],
      movements: [],
    })

    const { result } = renderHook(() => useStartProduction(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        hotel_id: hotelId,
        production_order_id: orderId,
      })
    })

    expect(startProduction).toHaveBeenCalledWith(supabase, {
      hotel_id: hotelId,
      production_order_id: orderId,
    })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['production', 'orders', hotelId],
    })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['production', 'order', hotelId, orderId],
    })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['inventory', 'snapshot'],
    })
  })

  it('propaga ProductionInsufficientStockError con déficits', async () => {
    const supabase = {}
    vi.mocked(createClient).mockReturnValue(supabase as ReturnType<typeof createClient>)
    vi.mocked(startProduction).mockRejectedValue(
      new ProductionInsufficientStockError([
        {
          product_id: '66666666-6666-4666-8666-666666666666',
          required: 12.5,
          available: 5,
          missing: 7.5,
        },
      ])
    )

    const { result } = renderHook(() => useStartProduction(), { wrapper })

    await expect(
      result.current.mutateAsync({
        hotel_id: hotelId,
        production_order_id: orderId,
      })
    ).rejects.toBeInstanceOf(ProductionInsufficientStockError)
  })
})
