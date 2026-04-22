// Catálogo de errores transversales del sistema.
// Las features pueden extender estas clases para errores específicos de dominio
// (ej. tenant-admin/domain/errors.ts ya define InviteNotFoundError, etc).
//
// Convención:
//   - Cada subclase declara `readonly code` literal y `readonly httpStatus`.
//   - El constructor acepta `message` opcional. Si no se pasa, usa el default.
//   - Los detalles operativos (ej. recurso no encontrado) van en propiedades extra,
//     no en el message — el message es para humanos, las propiedades para código.

export type AppErrorCode =
  | 'APP_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION'
  | 'RATE_LIMITED'
  | 'INFRASTRUCTURE'

export class AppError extends Error {
  readonly code: AppErrorCode = 'APP_ERROR'
  readonly httpStatus: number = 500

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = this.constructor.name
  }
}

export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND' as const
  readonly httpStatus = 404

  constructor(
    public readonly resource: string,
    message?: string,
    options?: { cause?: unknown }
  ) {
    super(message ?? `Recurso no encontrado: ${resource}`, options)
  }
}

export class ConflictError extends AppError {
  readonly code = 'CONFLICT' as const
  readonly httpStatus = 409

  constructor(message = 'Conflicto con el estado actual del recurso', options?: { cause?: unknown }) {
    super(message, options)
  }
}

export class UnauthorizedError extends AppError {
  readonly code = 'UNAUTHORIZED' as const
  readonly httpStatus = 401

  constructor(message = 'Sesión inválida o ausente', options?: { cause?: unknown }) {
    super(message, options)
  }
}

export class ForbiddenError extends AppError {
  readonly code = 'FORBIDDEN' as const
  readonly httpStatus = 403

  constructor(message = 'No tienes permiso para esta operación', options?: { cause?: unknown }) {
    super(message, options)
  }
}

export class ValidationError extends AppError {
  readonly code = 'VALIDATION' as const
  readonly httpStatus = 422

  constructor(
    message = 'Datos de entrada inválidos',
    public readonly fieldErrors?: Record<string, string[]>,
    options?: { cause?: unknown }
  ) {
    super(message, options)
  }
}

export class RateLimitedError extends AppError {
  readonly code = 'RATE_LIMITED' as const
  readonly httpStatus = 429

  constructor(
    message = 'Demasiadas peticiones, espera un momento',
    public readonly retryAfterSeconds?: number,
    options?: { cause?: unknown }
  ) {
    super(message, options)
  }
}

export class InfrastructureError extends AppError {
  readonly code = 'INFRASTRUCTURE' as const
  readonly httpStatus = 500

  constructor(message = 'Error de infraestructura', options?: { cause?: unknown }) {
    super(message, options)
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
