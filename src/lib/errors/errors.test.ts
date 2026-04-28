import { describe, expect, it } from 'vitest'
import {
  AppError,
  ConflictError,
  ForbiddenError,
  InfrastructureError,
  isAppError,
  NotFoundError,
  RateLimitedError,
  UnauthorizedError,
  ValidationError,
} from './index'
import { mapSupabaseError } from './map-supabase-error'

describe('AppError taxonomy', () => {
  it('NotFoundError exposes resource and httpStatus 404', () => {
    const err = new NotFoundError('event', 'No event 123')
    expect(err.code).toBe('NOT_FOUND')
    expect(err.httpStatus).toBe(404)
    expect(err.resource).toBe('event')
    expect(err.message).toBe('No event 123')
    expect(err.name).toBe('NotFoundError')
  })

  it('NotFoundError uses default message when omitted', () => {
    const err = new NotFoundError('client')
    expect(err.message).toBe('Recurso no encontrado: client')
  })

  it('ValidationError stores fieldErrors', () => {
    const err = new ValidationError('Invalid input', { name: ['required'] })
    expect(err.code).toBe('VALIDATION')
    expect(err.httpStatus).toBe(422)
    expect(err.fieldErrors).toEqual({ name: ['required'] })
  })

  it('RateLimitedError carries retryAfterSeconds', () => {
    const err = new RateLimitedError(undefined, 30)
    expect(err.code).toBe('RATE_LIMITED')
    expect(err.httpStatus).toBe(429)
    expect(err.retryAfterSeconds).toBe(30)
  })

  it.each([
    [new ConflictError(), 'CONFLICT', 409],
    [new UnauthorizedError(), 'UNAUTHORIZED', 401],
    [new ForbiddenError(), 'FORBIDDEN', 403],
    [new InfrastructureError(), 'INFRASTRUCTURE', 500],
  ])('%s has expected code/status', (err, code, status) => {
    expect(err.code).toBe(code)
    expect(err.httpStatus).toBe(status)
  })

  it('isAppError narrows correctly', () => {
    expect(isAppError(new NotFoundError('x'))).toBe(true)
    expect(isAppError(new Error('plain'))).toBe(false)
    expect(isAppError(null)).toBe(false)
    expect(isAppError({ code: 'FAKE' })).toBe(false)
  })

  it('subclasses are instances of AppError', () => {
    expect(new NotFoundError('x')).toBeInstanceOf(AppError)
    expect(new ConflictError()).toBeInstanceOf(AppError)
  })
})

describe('mapSupabaseError', () => {
  it('maps Postgres unique_violation (23505) to ConflictError', () => {
    const result = mapSupabaseError({ code: '23505', message: 'duplicate key' })
    expect(result).toBeInstanceOf(ConflictError)
    expect(result.message).toBe('duplicate key')
  })

  it('maps Postgres FK violation (23503) to ConflictError', () => {
    const result = mapSupabaseError({ code: '23503', message: 'fk violated' })
    expect(result).toBeInstanceOf(ConflictError)
  })

  it('maps Postgres not_null_violation (23502) to ValidationError', () => {
    const result = mapSupabaseError({ code: '23502', message: 'not null violated' })
    expect(result).toBeInstanceOf(ValidationError)
  })

  it('maps Postgres check_violation (23514) to ValidationError', () => {
    const result = mapSupabaseError({ code: '23514', message: 'check failed' })
    expect(result).toBeInstanceOf(ValidationError)
  })

  it('maps Postgres insufficient_privilege (42501) to ForbiddenError', () => {
    const result = mapSupabaseError({ code: '42501', message: 'denied' })
    expect(result).toBeInstanceOf(ForbiddenError)
  })

  it('maps PGRST116 (no rows) to NotFoundError with resource context', () => {
    const result = mapSupabaseError({ code: 'PGRST116', message: 'no rows' }, { resource: 'event' })
    expect(result).toBeInstanceOf(NotFoundError)
    expect((result as NotFoundError).resource).toBe('event')
  })

  it('maps PGRST116 to NotFoundError with default resource when context missing', () => {
    const result = mapSupabaseError({ code: 'PGRST116', message: 'no rows' })
    expect(result).toBeInstanceOf(NotFoundError)
    expect((result as NotFoundError).resource).toBe('recurso')
  })

  it('maps ChefOS P0003 (no active hotel) to ForbiddenError', () => {
    const result = mapSupabaseError({ code: 'P0003', message: 'no active hotel' })
    expect(result).toBeInstanceOf(ForbiddenError)
  })

  it('maps Auth status 401 to UnauthorizedError', () => {
    const result = mapSupabaseError({ status: 401, message: 'invalid token' })
    expect(result).toBeInstanceOf(UnauthorizedError)
  })

  it('maps Auth status 403 to ForbiddenError', () => {
    const result = mapSupabaseError({ status: 403, message: 'forbidden' })
    expect(result).toBeInstanceOf(ForbiddenError)
  })

  it('maps Auth status 404 to NotFoundError', () => {
    const result = mapSupabaseError({ status: 404, message: 'not found' })
    expect(result).toBeInstanceOf(NotFoundError)
  })

  it('maps Auth status 409 to ConflictError', () => {
    const result = mapSupabaseError({ status: 409, message: 'conflict' })
    expect(result).toBeInstanceOf(ConflictError)
  })

  it('maps Auth status 422 to ValidationError', () => {
    const result = mapSupabaseError({ status: 422, message: 'invalid email format' })
    expect(result).toBeInstanceOf(ValidationError)
  })

  it('falls back to message heuristics when no code is set', () => {
    expect(mapSupabaseError({ message: 'item not found' }, { resource: 'recipe' })).toBeInstanceOf(NotFoundError)
    expect(mapSupabaseError({ message: 'item not found' })).toBeInstanceOf(NotFoundError)
    expect(mapSupabaseError({ message: 'duplicate entry' })).toBeInstanceOf(ConflictError)
    expect(mapSupabaseError({ message: 'permission denied for table' })).toBeInstanceOf(ForbiddenError)
    expect(mapSupabaseError({ message: 'unauthorized' })).toBeInstanceOf(UnauthorizedError)
  })

  it('returns InfrastructureError for unknown errors', () => {
    const result = mapSupabaseError({ message: 'some weird internal error' })
    expect(result).toBeInstanceOf(InfrastructureError)
  })

  it('handles errors with numeric code gracefully', () => {
    const result = mapSupabaseError({ code: 500, message: 'internal' })
    expect(result).toBeInstanceOf(InfrastructureError)
  })

  it('extracts message from native Error instances gracefully', () => {
    const result = mapSupabaseError(new Error('native error extracted'))
    expect(result).toBeInstanceOf(InfrastructureError)
    expect(result.message).toBe('native error extracted')
  })

  it('handles native Error instances with missing message gracefully', () => {
    const err = new Error('native')
    Object.defineProperty(err, 'message', { value: undefined })
    const result = mapSupabaseError(err)
    expect(result).toBeInstanceOf(InfrastructureError)
    expect(result.message).toBe('Error desconocido')
  })

  it('handles non-object input gracefully', () => {
    const result = mapSupabaseError('string error')
    expect(result).toBeInstanceOf(InfrastructureError)
    expect(result.message).toBe('Error desconocido')
  })

  it('handles empty object input gracefully', () => {
    const result = mapSupabaseError({})
    expect(result).toBeInstanceOf(InfrastructureError)
    expect(result.message).toBe('Error desconocido')
  })

  it('preserves the raw error as cause', () => {
    const raw = { code: '23505', message: 'duplicate' }
    const result = mapSupabaseError(raw)
    expect(result.cause).toBe(raw)
  })
})
