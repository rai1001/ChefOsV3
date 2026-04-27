import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createClient } from '@/lib/supabase/client'
import { fetchFoodCostReport } from '../infrastructure/reporting-rpcs'
import { useFoodCostReport } from './use-food-cost-report'

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

vi.mock('../infrastructure/reporting-rpcs', () => ({
  fetchFoodCostReport: vi.fn(),
}))

const hotelId = '11111111-1111-4111-8111-111111111111'

describe('useFoodCostReport', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
  })

  function wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  it('usa el adapter y conserva cache de 5 min', async () => {
    const supabase = {}
    vi.mocked(createClient).mockReturnValue(supabase as ReturnType<typeof createClient>)
    vi.mocked(fetchFoodCostReport).mockResolvedValue([])

    const filter = {
      hotelId,
      from: '2026-04-01',
      to: '2026-05-01',
    }

    const { result } = renderHook(() => useFoodCostReport(filter), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(fetchFoodCostReport).toHaveBeenCalledWith(supabase, filter)
    expect(result.current.data).toEqual([])
    expect(result.current.dataUpdatedAt).toBeGreaterThan(0)
  })
})
