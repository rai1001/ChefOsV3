import { describe, expect, it } from 'vitest'
import { mapAuthError } from './auth-errors'

describe('mapAuthError', () => {
  it('maps invalid_credentials to neutral login message', () => {
    const result = mapAuthError({ message: 'Invalid login credentials', status: 400 })
    expect(result.code).toBe('invalid_credentials')
    expect(result.userMessage).toBe('Credenciales incorrectas. Si el problema persiste, contacta con soporte.')
    expect(result.internalMessage).toBe('Invalid login credentials')
  })

  it('uses neutral reset message for reset flow', () => {
    const result = mapAuthError({ message: 'Invalid login credentials', status: 400 }, 'reset')
    expect(result.userMessage).toBe('No hemos podido procesar la solicitud. Inténtalo de nuevo en unos minutos.')
  })

  it('detects rate limit by status 429', () => {
    const result = mapAuthError({ status: 429, message: 'Rate limit exceeded' })
    expect(result.code).toBe('rate_limited')
    expect(result.userMessage).toContain('Demasiados intentos')
  })

  it('detects rate limit by message text', () => {
    const result = mapAuthError({ message: 'Email rate limit exceeded' })
    expect(result.code).toBe('rate_limited')
  })

  it('detects email_not_confirmed', () => {
    const result = mapAuthError({ message: 'Email not confirmed' })
    expect(result.code).toBe('email_not_confirmed')
    expect(result.userMessage).toContain('confirmar tu email')
  })

  it('hides email_already_in_use behind neutral message in signup flow', () => {
    const result = mapAuthError({ message: 'User already registered' }, 'signup')
    expect(result.code).toBe('email_already_in_use')
    expect(result.userMessage).toContain('recibirás instrucciones')
    expect(result.userMessage).not.toContain('ya')
  })

  it('detects weak_password', () => {
    const result = mapAuthError({ message: 'Password should be at least 6 characters' })
    expect(result.code).toBe('weak_password')
    expect(result.userMessage).toContain('contraseña')
  })

  it('detects network errors via TypeError name', () => {
    const result = mapAuthError({ name: 'TypeError', message: 'fetch failed' })
    expect(result.code).toBe('network_error')
    expect(result.userMessage).toContain('contactar con el servicio')
  })

  it('falls back to generic for unknown errors', () => {
    const result = mapAuthError({ message: 'Something weird' })
    expect(result.code).toBe('generic')
    expect(result.userMessage).toBe('Credenciales incorrectas. Si el problema persiste, contacta con soporte.')
    expect(result.internalMessage).toBe('Something weird')
  })

  it('handles non-object input', () => {
    expect(mapAuthError('string error').code).toBe('generic')
    expect(mapAuthError(null).code).toBe('generic')
    expect(mapAuthError(undefined).code).toBe('generic')
  })

  it('always preserves the internal message for logging', () => {
    const result = mapAuthError({ message: 'Detailed Supabase trace: user xyz tried to sign in' })
    expect(result.internalMessage).toContain('Detailed Supabase trace')
    // The user message must NOT contain internal detail.
    expect(result.userMessage).not.toContain('xyz')
  })
})
