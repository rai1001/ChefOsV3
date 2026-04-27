import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createBrowserClient } from '@supabase/ssr'

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(),
}))

describe('Supabase Browser Client', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('initializes createBrowserClient with environment variables', async () => {
    const mockUrl = 'https://mock-url.supabase.co'
    const mockKey = 'mock-anon-key'

    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', mockUrl)
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', mockKey)

    const { createClient } = await import('./client')

    const mockClient = { auth: {} }
    vi.mocked(createBrowserClient).mockReturnValue(mockClient as any)

    const client = createClient()

    expect(createBrowserClient).toHaveBeenCalledTimes(1)
    expect(createBrowserClient).toHaveBeenCalledWith(mockUrl, mockKey)
    expect(client).toBe(mockClient)
  })
})
