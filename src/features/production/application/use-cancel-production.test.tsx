import React from 'react'
import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createClient } from '@/lib/supabase/client'
import { cancelProduction } from '../infrastructure/production-rpcs'
import { useCancelProduction } from './use-cancel-production'

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

vi.mock('../infrastructure/production-rpcs', () => ({
  cancelProduction: vi.fn(),
}))

const hotelId = '22222222-2222-4222-8222-222222222222'
const orderId = '44444444-4444-4444-8444-444444444444'

describe('useCancelProduction', () => {
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

  it('cancela orden e invalida detalle/listado', async () => {
    const supabase = {}
    vi.mocked(createClient).mockReturnValue(supabase as ReturnType<typeof createClient>)
    vi.mocked(cancelProduction).mockResolvedValue({
      order: {
        id: orderId,
        hotel_id: hotelId,
        recipe_id: '33333333-3333-4333-8333-333333333333',
        recipe_name: 'Crema de calabaza',
        servings: 80,
        status: 'cancelled',
        scheduled_at: null,
        started_at: null,
        completed_at: null,
        cancelled_at: '2026-04-27T10:00:00.000Z',
        cancellation_reason: 'Cambio de menú',
        estimated_total_cost: 27.5,
        actual_total_cost: 0,
        notes: 'Cancelada: Cambio de menú',
        created_by: null,
        created_at: '2026-04-27T09:00:00.000Z',
        updated_at: '2026-04-27T10:00:00.000Z',
      },
      lines: [],
      movements: [],
      subrecipe_productions: [],
    })

    const { result } = renderHook(() => useCancelProduction(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        hotel_id: hotelId,
        production_order_id: orderId,
        reason: 'Cambio de menú',
      })
    })

    expect(cancelProduction).toHaveBeenCalledWith(supabase, {
      hotel_id: hotelId,
      production_order_id: orderId,
      reason: 'Cambio de menú',
    })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['production', 'orders', hotelId],
    })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['production', 'order', hotelId, orderId],
    })
  })
})
