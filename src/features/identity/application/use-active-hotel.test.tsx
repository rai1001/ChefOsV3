import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest'
import { useActiveHotel } from './use-active-hotel'
import { createClient } from '@/lib/supabase/client'
import { callGetActiveHotel } from '../infrastructure/identity-queries'
import { NoActiveHotelError } from '../domain/errors'
import React from 'react'

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

vi.mock('../infrastructure/identity-queries', () => ({
  callGetActiveHotel: vi.fn(),
}))

describe('useActiveHotel', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  it('should return loading state initially', () => {
    vi.mocked(callGetActiveHotel).mockImplementation(() => new Promise(() => {}))
    const { result } = renderHook(() => useActiveHotel(), { wrapper })
    expect(result.current.isLoading).toBe(true)
  })

  it('should fetch and return active hotel successfully', async () => {
    const mockHotel = { id: 'hotel-123', name: 'Grand Hotel' }
    vi.mocked(callGetActiveHotel).mockResolvedValueOnce(mockHotel as any)

    const { result } = renderHook(() => useActiveHotel(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockHotel)
    expect(createClient).toHaveBeenCalled()
    expect(callGetActiveHotel).toHaveBeenCalled()
  })

  it('should handle error when no active hotel is found', async () => {
    const error = new NoActiveHotelError()
    vi.mocked(callGetActiveHotel).mockRejectedValueOnce(error)

    const { result } = renderHook(() => useActiveHotel(), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(error)
    expect(createClient).toHaveBeenCalled()
    expect(callGetActiveHotel).toHaveBeenCalled()
  })
})
