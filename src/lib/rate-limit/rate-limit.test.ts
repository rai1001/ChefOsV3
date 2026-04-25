import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { checkRateLimit, identifierFromHeaders } from './index'

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

describe('identifierFromHeaders', () => {
  it('prioritizes trustedIp when provided', () => {
    const headers = new Headers({ 'x-forwarded-for': 'spoofed.ip.address' })
    expect(identifierFromHeaders(headers, '1.2.3.4')).toBe('1.2.3.4')
  })

  it('uses x-forwarded-for first IP when present and no trustedIp', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.5, 10.0.0.1' })
    expect(identifierFromHeaders(headers)).toBe('203.0.113.5')
  })

  it('falls back to x-real-ip when x-forwarded-for is missing', () => {
    const headers = new Headers({ 'x-real-ip': '198.51.100.7' })
    expect(identifierFromHeaders(headers)).toBe('198.51.100.7')
  })

  it('returns "anonymous" when no IP headers are set', () => {
    expect(identifierFromHeaders(new Headers())).toBe('anonymous')
  })

  it('handles empty x-forwarded-for', () => {
    const headers = new Headers({ 'x-forwarded-for': '' })
    expect(identifierFromHeaders(headers)).toBe('anonymous')
  })
})
