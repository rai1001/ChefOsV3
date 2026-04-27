import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type NextRequest } from 'next/server'
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
    const request = { ip: '203.0.113.5' } as NextRequest
    expect(identifierFromRequest(request)).toBe('203.0.113.5')
  })

  it('returns "anonymous" when request.ip is missing (e.g. local development)', () => {
    const request = {} as NextRequest
    expect(identifierFromRequest(request)).toBe('anonymous')
  })
})
