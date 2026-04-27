import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { checkRateLimit, identifierFromRequest } from './index'

beforeEach(() => {
  vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('checkRateLimit (skip mode without Upstash vars)', () => {
  it('always allows when env vars are missing', async () => {
    const result = await checkRateLimit('login', 'anonymous')
    expect(result.ok).toBe(true)
    expect(result.remaining).toBe(Number.POSITIVE_INFINITY)
    expect(result.retryAfterSeconds).toBe(0)
  })

  it('skip mode handles all presets', async () => {
    expect((await checkRateLimit('signup', 'x')).ok).toBe(true)
    expect((await checkRateLimit('forgot-password', 'x')).ok).toBe(true)
    expect((await checkRateLimit('invite-accept', 'x')).ok).toBe(true)
  })
})

describe('identifierFromRequest', () => {
  it('uses request.ip when present', () => {
    const req = new NextRequest('http://localhost')
    Object.defineProperty(req, 'ip', { value: '203.0.113.5' })
    expect(identifierFromRequest(req)).toBe('203.0.113.5')
  })

  it('returns "anonymous" when request.ip is absent', () => {
    const req = new NextRequest('http://localhost')
    // NextRequest.ip is missing in normal instantiations / local dev by default
    expect(identifierFromRequest(req)).toBe('anonymous')
  })

  it('ignores headers completely to prevent IP spoofing', () => {
    const req = new NextRequest('http://localhost', {
      headers: {
        'x-forwarded-for': '198.51.100.7',
        'x-real-ip': '198.51.100.7',
      },
    })
    // Ensure it still returns anonymous even if headers are provided,
    // since we only trust request.ip (which Next.js securely populates).
    expect(identifierFromRequest(req)).toBe('anonymous')
  })
})
