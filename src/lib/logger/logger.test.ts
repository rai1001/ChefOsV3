import { afterEach, describe, expect, it, vi } from 'vitest'
import { newCorrelationId } from './index'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('newCorrelationId', () => {
  it('uses crypto.randomUUID when available', () => {
    const randomUUID = vi.fn(() => 'uuid-from-randomUUID')

    vi.stubGlobal('crypto', { randomUUID } as Pick<Crypto, 'randomUUID'>)

    expect(newCorrelationId()).toBe('uuid-from-randomUUID')
    expect(randomUUID).toHaveBeenCalledTimes(1)
  })

  it('builds a UUID v4 from crypto.getRandomValues when randomUUID is not available', () => {
    const bytes = new Uint8Array(16)
    bytes.set([0x12, 0x34, 0x56, 0x78, 0x90, 0xab, 0xcd, 0xef, 0x12, 0x34, 0x56, 0x78, 0x90, 0xab, 0xcd, 0xef])

    const getRandomValues = vi.fn((target: Uint8Array) => {
      target.set(bytes)
      return target
    })

    vi.stubGlobal('crypto', { getRandomValues } as Pick<Crypto, 'getRandomValues'>)

    expect(newCorrelationId()).toBe('12345678-90ab-4def-9234-567890abcdef')
    expect(getRandomValues).toHaveBeenCalledTimes(1)
  })

  it('throws when a secure crypto API is unavailable', () => {
    vi.stubGlobal('crypto', undefined)

    expect(() => newCorrelationId()).toThrow(
      'Secure crypto API is unavailable; cannot generate correlation ID.',
    )
  })

  it('throws when crypto.getRandomValues returns insufficient bytes', () => {
    const getRandomValues = vi.fn(() => new Uint8Array(8))
    vi.stubGlobal('crypto', { getRandomValues } as Pick<Crypto, 'getRandomValues'>)

    expect(() => newCorrelationId()).toThrow(
      'Secure crypto API returned insufficient entropy for UUID generation.',
    )
  })
})
