import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { newCorrelationId } from './index'

describe('newCorrelationId', () => {
  const originalCrypto = globalThis.crypto

  beforeEach(() => {
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      writable: true,
      configurable: true,
    })
  })

  it('uses crypto.randomUUID when available', () => {
    const randomUUIDMock = vi.fn().mockReturnValue('mock-uuid-1234')

    globalThis.crypto = {
      ...originalCrypto,
      randomUUID: randomUUIDMock,
    } as any

    const id = newCorrelationId()

    expect(randomUUIDMock).toHaveBeenCalled()
    expect(id).toBe('mock-uuid-1234')
  })

  it('uses crypto.getRandomValues with corr_ prefix when randomUUID is not available', () => {
    const getRandomValuesMock = vi.fn().mockImplementation((array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = i // 000102030405060708090a0b0c0d0e0f
      }
      return array
    })

    globalThis.crypto = {
      ...originalCrypto,
      randomUUID: undefined,
      getRandomValues: getRandomValuesMock,
    } as any

    const id = newCorrelationId()

    expect(getRandomValuesMock).toHaveBeenCalled()
    expect(id).toBe('corr_000102030405060708090a0b0c0d0e0f')
  })

  it('throws an error if no secure cryptographic primitives are available', () => {
    globalThis.crypto = undefined as any

    expect(() => newCorrelationId()).toThrow('Secure cryptographic primitives are not available in this environment')
  })

  it('throws an error if crypto exists but has no secure methods', () => {
    globalThis.crypto = {
      ...originalCrypto,
      randomUUID: undefined,
      getRandomValues: undefined,
    } as any

    expect(() => newCorrelationId()).toThrow('Secure cryptographic primitives are not available in this environment')
  })
})
