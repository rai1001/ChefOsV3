import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildAbsoluteUrl,
  getAllowedAppOrigin,
  getCanonicalAppUrl,
  InvalidAppUrlError,
  MissingAppUrlError,
} from './index'

const ORIGINAL_ENV = { ...process.env }

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_APP_URL
  delete process.env.APP_URL_ALLOWLIST
  vi.stubEnv('NODE_ENV', 'test')
})

afterEach(() => {
  vi.unstubAllEnvs()
  process.env = { ...ORIGINAL_ENV }
})

describe('getCanonicalAppUrl', () => {
  it('returns dev default when NEXT_PUBLIC_APP_URL is unset and not enforcing allowlist', () => {
    expect(getCanonicalAppUrl()).toBe('http://localhost:3000')
  })

  it('uses NEXT_PUBLIC_APP_URL when set', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    expect(getCanonicalAppUrl()).toBe('http://localhost:3000')
  })

  it('strips path and trailing slash', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000/some/path'
    expect(getCanonicalAppUrl()).toBe('http://localhost:3000')
  })

  it('throws when enforceAllowlist=true and URL is not in the allowlist', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://evil.com'
    expect(() => getCanonicalAppUrl({ enforceAllowlist: true })).toThrow(InvalidAppUrlError)
  })

  it('accepts URL when in custom allowlist', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.chefos.dev'
    process.env.APP_URL_ALLOWLIST = 'https://app.chefos.dev,https://app.chefos.com'
    expect(getCanonicalAppUrl({ enforceAllowlist: true })).toBe('https://app.chefos.dev')
  })

  it('rejects URL not in custom allowlist', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.attacker.com'
    process.env.APP_URL_ALLOWLIST = 'https://app.chefos.dev,https://app.chefos.com'
    expect(() => getCanonicalAppUrl({ enforceAllowlist: true })).toThrow(InvalidAppUrlError)
  })

  it('does not enforce allowlist by default in test env', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://random.example'
    vi.stubEnv('NODE_ENV', 'test')
    expect(getCanonicalAppUrl()).toBe('https://random.example')
  })

  it('enforces allowlist by default in production env', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://evil.com'
    vi.stubEnv('NODE_ENV', 'production')
    expect(() => getCanonicalAppUrl()).toThrow(InvalidAppUrlError)
  })

  it('falls back to dev default when env value is malformed outside production', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'not a url'
    expect(getCanonicalAppUrl()).toBe('http://localhost:3000')
  })

  it('throws when NEXT_PUBLIC_APP_URL is missing in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(() => getCanonicalAppUrl()).toThrow(MissingAppUrlError)
  })

  it('throws when NEXT_PUBLIC_APP_URL is malformed in production', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'not a url'
    vi.stubEnv('NODE_ENV', 'production')
    expect(() => getCanonicalAppUrl()).toThrow(MissingAppUrlError)
  })
})

describe('buildAbsoluteUrl', () => {
  it('joins base and path correctly', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    expect(buildAbsoluteUrl('/invite/abc')).toBe('http://localhost:3000/invite/abc')
  })

  it('adds leading slash when missing', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    expect(buildAbsoluteUrl('invite/abc')).toBe('http://localhost:3000/invite/abc')
  })

  it('throws if base URL fails allowlist enforcement', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://evil.com'
    expect(() => buildAbsoluteUrl('/x', { enforceAllowlist: true })).toThrow(InvalidAppUrlError)
  })
})

describe('getAllowedAppOrigin', () => {
  it('returns preferred origin when it is in allowlist', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.chefos.dev'
    process.env.APP_URL_ALLOWLIST = 'https://app.chefos.dev,https://staging.chefos.dev'
    expect(getAllowedAppOrigin('https://staging.chefos.dev')).toBe('https://staging.chefos.dev')
  })

  it('falls back to canonical origin when preferred origin is not in allowlist', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.chefos.dev'
    process.env.APP_URL_ALLOWLIST = 'https://app.chefos.dev,https://staging.chefos.dev'
    expect(getAllowedAppOrigin('https://attacker.com')).toBe('https://app.chefos.dev')
  })
})
