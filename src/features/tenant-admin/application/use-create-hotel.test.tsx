import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useCreateHotel } from './use-create-hotel'
import { createClient } from '@/lib/supabase/client'
import { createHotel } from '../infrastructure/tenant-queries'
import type { CreateHotelInput } from '../domain/types'
import { ReactNode } from 'react'

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

vi.mock('../infrastructure/tenant-queries', () => ({
  createHotel: vi.fn(),
}))

describe('useCreateHotel', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    })
    vi.clearAllMocks()

    // Setup default mock implementation for createClient
    ;(createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue({})
  })

  afterEach(() => {
    queryClient.clear()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('should call createHotel and invalidate queries on success', async () => {
    const mockHotelId = 'mock-hotel-id'
    ;(createHotel as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockHotelId)

    // Spy on invalidateQueries
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateHotel(), { wrapper })

    const input: CreateHotelInput = {
      tenant_id: 'tenant-1',
      name: 'New Hotel',
      slug: 'new-hotel',
      timezone: 'UTC',
      currency: 'USD',
    }

    const mutatePromise = result.current.mutateAsync(input)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const data = await mutatePromise

    // Verify createHotel was called with correct arguments
    expect(createHotel).toHaveBeenCalledTimes(1)
    expect(createHotel).toHaveBeenCalledWith(expect.anything(), input)

    // Verify correct result
    expect(data).toBe(mockHotelId)

    // Verify cache invalidation
    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2)
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['tenant-admin', 'hotels'] })
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['user-hotels'] })
  })

  it('should propagate error and not invalidate queries on failure', async () => {
    const mockError = new Error('Failed to create hotel')
    ;(createHotel as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

    // Spy on invalidateQueries
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateHotel(), { wrapper })

    const input: CreateHotelInput = {
      tenant_id: 'tenant-1',
      name: 'New Hotel',
      slug: 'new-hotel',
      timezone: 'UTC',
      currency: 'USD',
    }

    // Capture the rejected promise to prevent unhandled rejection
    const mutatePromise = result.current.mutateAsync(input).catch(e => e)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    const error = await mutatePromise

    // Verify createHotel was called
    expect(createHotel).toHaveBeenCalledTimes(1)

    // Verify error propagation
    expect(error).toBe(mockError)

    // Verify cache was NOT invalidated
    expect(invalidateQueriesSpy).not.toHaveBeenCalled()
  })
})
