import { ForbiddenError, UnauthorizedError } from '@/lib/errors'

export class NotAuthenticatedError extends UnauthorizedError {
  override readonly code = 'NOT_AUTHENTICATED' as const
  constructor(message = 'Usuario no autenticado') {
    super(message)
    this.name = 'NotAuthenticatedError'
  }
}

export class NoActiveHotelError extends ForbiddenError {
  override readonly code = 'NO_ACTIVE_HOTEL' as const
  constructor(message = 'El usuario no tiene hotel activo asignado') {
    super(message)
    this.name = 'NoActiveHotelError'
  }
}

export class InsufficientRoleError extends ForbiddenError {
  override readonly code = 'INSUFFICIENT_ROLE' as const
  constructor(
    public readonly required: readonly string[],
    public readonly actual: string,
    message?: string
  ) {
    super(message ?? `Se requiere uno de: ${required.join(', ')}. Rol actual: ${actual}`)
    this.name = 'InsufficientRoleError'
  }
}
