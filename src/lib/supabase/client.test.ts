import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createClient } from './client'
import { createBrowserClient } from '@supabase/ssr'

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(),
}))

describe('createClient', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://mock-project.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'mock-anon-key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('initializes the browser client with correct environment variables', () => {
    createClient()

    expect(createBrowserClient).toHaveBeenCalledWith(
      'https://mock-project.supabase.co',
      'mock-anon-key'
    )
  })
})
