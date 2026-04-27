import { describe, expect, it } from 'vitest'
import { NotAuthenticatedError, NoActiveHotelError, InsufficientRoleError } from './errors'
import { AppError, UnauthorizedError, ForbiddenError } from '@/lib/errors'

describe('Domain Errors', () => {
  describe('NotAuthenticatedError', () => {
    it('should initialize with default values', () => {
      const error = new NotAuthenticatedError()

      expect(error.message).toBe('Usuario no autenticado')
      expect(error.code).toBe('NOT_AUTHENTICATED')
      expect(error.name).toBe('NotAuthenticatedError')
      expect(error.httpStatus).toBe(401)
    })

    it('should initialize with a custom message', () => {
      const error = new NotAuthenticatedError('Custom unauthenticated message')

      expect(error.message).toBe('Custom unauthenticated message')
    })

    it('should inherit from UnauthorizedError and AppError', () => {
      const error = new NotAuthenticatedError()

      expect(error instanceof NotAuthenticatedError).toBe(true)
      expect(error instanceof UnauthorizedError).toBe(true)
      expect(error instanceof AppError).toBe(true)
      expect(error instanceof Error).toBe(true)
    })
  })

  describe('NoActiveHotelError', () => {
    it('should initialize with default values', () => {
      const error = new NoActiveHotelError()

      expect(error.message).toBe('El usuario no tiene hotel activo asignado')
      expect(error.code).toBe('NO_ACTIVE_HOTEL')
      expect(error.name).toBe('NoActiveHotelError')
      expect(error.httpStatus).toBe(403)
    })

    it('should initialize with a custom message', () => {
      const error = new NoActiveHotelError('Custom no hotel message')

      expect(error.message).toBe('Custom no hotel message')
    })

    it('should inherit from ForbiddenError and AppError', () => {
      const error = new NoActiveHotelError()

      expect(error instanceof NoActiveHotelError).toBe(true)
      expect(error instanceof ForbiddenError).toBe(true)
      expect(error instanceof AppError).toBe(true)
      expect(error instanceof Error).toBe(true)
    })
  })

  describe('InsufficientRoleError', () => {
    it('should initialize with default message combining required and actual roles', () => {
      const error = new InsufficientRoleError(['admin', 'manager'], 'user')

      expect(error.message).toBe('Se requiere uno de: admin, manager. Rol actual: user')
      expect(error.code).toBe('INSUFFICIENT_ROLE')
      expect(error.name).toBe('InsufficientRoleError')
      expect(error.httpStatus).toBe(403)
      expect(error.required).toEqual(['admin', 'manager'])
      expect(error.actual).toBe('user')
    })

    it('should initialize with a custom message if provided', () => {
      const error = new InsufficientRoleError(['admin'], 'user', 'Custom insufficient role message')

      expect(error.message).toBe('Custom insufficient role message')
      expect(error.required).toEqual(['admin'])
      expect(error.actual).toBe('user')
    })

    it('should inherit from ForbiddenError and AppError', () => {
      const error = new InsufficientRoleError(['admin'], 'user')

      expect(error instanceof InsufficientRoleError).toBe(true)
      expect(error instanceof ForbiddenError).toBe(true)
      expect(error instanceof AppError).toBe(true)
      expect(error instanceof Error).toBe(true)
    })
  })
})
