import { describe, it, expect, vi } from 'vitest'
import { GET } from './route'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    redirect: vi.fn((url) => ({ status: 307, url: url.toString() }))
  }
}))

// Mock Supabase Server Client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}))

describe('Auth Callback Route', () => {
  it('redirects to the provided valid relative "next" URL on success', async () => {
    const mockExchangeCodeForSession = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession,
      }
    } as any)

    const request = new Request('http://localhost:3000/callback?code=test_code&next=/dashboard')
    const response = await GET(request)

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('test_code')
    expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('http://localhost:3000/dashboard'))
  })

  it('falls back to "/" when "next" is an external URL', async () => {
    const mockExchangeCodeForSession = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession,
      }
    } as any)

    const request = new Request('http://localhost:3000/callback?code=test_code&next=https://evil.com')
    const response = await GET(request)

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('test_code')
    expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('http://localhost:3000/'))
  })

  it('falls back to "/" when "next" is a protocol-relative external URL', async () => {
    const mockExchangeCodeForSession = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession,
      }
    } as any)

    const request = new Request('http://localhost:3000/callback?code=test_code&next=//evil.com')
    const response = await GET(request)

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('test_code')
    expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('http://localhost:3000/'))
  })

  it('redirects to the login error page when authentication fails', async () => {
    const mockExchangeCodeForSession = vi.fn().mockResolvedValue({ error: new Error('auth failed') })
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession,
      }
    } as any)

    const request = new Request('http://localhost:3000/callback?code=test_code')
    const response = await GET(request)

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('test_code')
    expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('http://localhost:3000/login?error=auth_callback_error'))
  })

  it('redirects to the login error page when no code is provided', async () => {
    const request = new Request('http://localhost:3000/callback?next=/dashboard')
    const response = await GET(request)

    expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('http://localhost:3000/login?error=auth_callback_error'))
  })
})
