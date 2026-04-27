import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Resend } from 'resend'

describe('getResendClient', () => {

  beforeEach(() => {
    // Reset module registry so the `let cached` and `let warned` variables
    // in `client.ts` are reset for every test.
    vi.resetModules()
    // Reset process.env mock to ensure test isolation
    vi.stubEnv('RESEND_API_KEY', '')
    vi.stubEnv('NODE_ENV', 'test')
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should return null if RESEND_API_KEY is not defined', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    const { getResendClient } = await import('./client')
    expect(getResendClient()).toBeNull()
  })

  it('should not warn if RESEND_API_KEY is missing but NODE_ENV is test', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubEnv('RESEND_API_KEY', '')
    vi.stubEnv('NODE_ENV', 'test')

    const { getResendClient } = await import('./client')
    getResendClient()

    expect(consoleWarnSpy).not.toHaveBeenCalled()
  })

  it('should warn exactly once if RESEND_API_KEY is missing and NODE_ENV is not test', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubEnv('RESEND_API_KEY', '')
    vi.stubEnv('NODE_ENV', 'development')

    const { getResendClient } = await import('./client')

    // First call logs warning
    getResendClient()
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('RESEND_API_KEY no configurada')
    )

    // Second call does not log warning again
    getResendClient()
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
  })

  it('should return a Resend instance when RESEND_API_KEY is defined', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_123456789')
    const { getResendClient } = await import('./client')

    const client = getResendClient()
    expect(client).toBeInstanceOf(Resend)
  })

  it('should cache the Resend instance', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_123456789')
    const { getResendClient } = await import('./client')

    const firstClient = getResendClient()
    const secondClient = getResendClient()

    expect(firstClient).toBeInstanceOf(Resend)
    expect(firstClient).toBe(secondClient)
  })
})
