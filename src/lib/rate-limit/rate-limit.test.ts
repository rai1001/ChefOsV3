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
  it('uses x-vercel-ip when present', () => {
    const headers = new Headers({ 'x-vercel-ip': '203.0.113.5' })
    expect(identifierFromHeaders(headers)).toBe('203.0.113.5')
  })

  it('uses cf-connecting-ip when x-vercel-ip is missing', () => {
    const headers = new Headers({ 'cf-connecting-ip': '198.51.100.11' })
    expect(identifierFromHeaders(headers)).toBe('198.51.100.11')
  })

  it('falls back to x-real-ip when edge headers are missing', () => {
    const headers = new Headers({ 'x-real-ip': '198.51.100.7' })
    expect(identifierFromHeaders(headers)).toBe('198.51.100.7')
  })

  it('ignores x-forwarded-for because it is spoofable', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.5, 10.0.0.1' })
    expect(identifierFromHeaders(headers)).toBe('anonymous')
  })

  it('returns "anonymous" when no IP headers are set', () => {
    expect(identifierFromHeaders(new Headers())).toBe('anonymous')
  })

  it('handles empty trusted ip headers', () => {
    const headers = new Headers({ 'x-vercel-ip': '' })
    expect(identifierFromHeaders(headers)).toBe('anonymous')
  })
})
