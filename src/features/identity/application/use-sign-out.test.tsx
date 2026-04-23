import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest'
import { useSignOut } from './use-sign-out'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import React from 'react'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

describe('useSignOut', () => {
  let queryClient: QueryClient
  let mockRouter: { push: Mock; refresh: Mock }
  let mockSupabase: { auth: { signOut: Mock } }

  beforeEach(() => {
    vi.clearAllMocks()

    queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    })

    vi.spyOn(queryClient, 'clear')

    mockRouter = {
      push: vi.fn(),
      refresh: vi.fn(),
    }
    vi.mocked(useRouter).mockReturnValue(mockRouter as unknown as ReturnType<typeof useRouter>)

    mockSupabase = {
      auth: {
        signOut: vi.fn().mockResolvedValue(undefined),
      },
    }
    vi.mocked(createClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createClient>)
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  it('should sign out successfully and clear state', async () => {
    const { result } = renderHook(() => useSignOut(), { wrapper })

    result.current.mutate()

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(createClient).toHaveBeenCalled()
    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    expect(queryClient.clear).toHaveBeenCalled()
    expect(mockRouter.push).toHaveBeenCalledWith('/login')
    expect(mockRouter.refresh).toHaveBeenCalled()
  })

  it('should propagate error and not clear state on failure', async () => {
    const error = new Error('Sign out failed')
    mockSupabase.auth.signOut.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useSignOut(), { wrapper })

    result.current.mutate()

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(error)
    expect(createClient).toHaveBeenCalled()
    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    expect(queryClient.clear).not.toHaveBeenCalled()
    expect(mockRouter.push).not.toHaveBeenCalled()
    expect(mockRouter.refresh).not.toHaveBeenCalled()
  })
})
