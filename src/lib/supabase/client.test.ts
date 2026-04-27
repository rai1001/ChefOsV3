import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createClient } from './client'
import { createBrowserClient } from '@supabase/ssr'

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(),
}))

describe('Supabase Client (Browser)', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://mock-project.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'mock-anon-key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('should call createBrowserClient with the correct environment variables', () => {
    const mockClient = { auth: {} }
    vi.mocked(createBrowserClient).mockReturnValue(mockClient as any)

    const client = createClient()

    expect(createBrowserClient).toHaveBeenCalledTimes(1)
    expect(createBrowserClient).toHaveBeenCalledWith(
      'https://mock-project.supabase.co',
      'mock-anon-key'
    )
    expect(client).toBe(mockClient)
  })
})
