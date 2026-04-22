export class NotAuthenticatedError extends Error {
  readonly code = 'NOT_AUTHENTICATED' as const
  constructor(message = 'Usuario no autenticado') {
    super(message)
    this.name = 'NotAuthenticatedError'
  }
}

export class NoActiveHotelError extends Error {
  readonly code = 'NO_ACTIVE_HOTEL' as const
  constructor(message = 'El usuario no tiene hotel activo asignado') {
    super(message)
    this.name = 'NoActiveHotelError'
  }
}

export class InsufficientRoleError extends Error {
  readonly code = 'INSUFFICIENT_ROLE' as const
  constructor(
    public readonly required: readonly string[],
    public readonly actual: string,
    message?: string
  ) {
    super(message ?? `Se requiere uno de: ${required.join(', ')}. Rol actual: ${actual}`)
    this.name = 'InsufficientRoleError'
  }
}
