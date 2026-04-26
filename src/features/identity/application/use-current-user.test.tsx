import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest'
import { useCurrentUser } from './use-current-user'
import { createClient } from '@/lib/supabase/client'
import React from 'react'

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

describe('useCurrentUser', () => {
  let queryClient: QueryClient
  let mockSupabase: { auth: { getUser: Mock } }

  beforeEach(() => {
    vi.clearAllMocks()

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createClient>)
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  it('should return user when getUser succeeds with a user', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' }
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: mockUser } })

    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockUser)
    expect(createClient).toHaveBeenCalled()
    expect(mockSupabase.auth.getUser).toHaveBeenCalled()
  })

  it('should return null when getUser succeeds but returns no user', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } })

    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeNull()
    expect(createClient).toHaveBeenCalled()
    expect(mockSupabase.auth.getUser).toHaveBeenCalled()
  })

  it('should handle error when getUser fails', async () => {
    const error = new Error('Auth error')
    mockSupabase.auth.getUser.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useCurrentUser(), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(error)
    expect(createClient).toHaveBeenCalled()
    expect(mockSupabase.auth.getUser).toHaveBeenCalled()
  })
})
