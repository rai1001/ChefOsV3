import { NotFoundError, ConflictError, ValidationError } from '@/lib/errors'
import type { EventStatus } from './types'

export class EventNotFoundError extends NotFoundError {
  override readonly code = 'EVENT_NOT_FOUND' as const
  constructor(
    public readonly eventId: string,
    message?: string
  ) {
    super('Event', message ?? `Evento no encontrado: ${eventId}`)
    this.name = 'EventNotFoundError'
  }
}

export class ClientNotFoundError extends NotFoundError {
  override readonly code = 'CLIENT_NOT_FOUND' as const
  constructor(
    public readonly clientId: string,
    message?: string
  ) {
    super('Client', message ?? `Cliente no encontrado: ${clientId}`)
    this.name = 'ClientNotFoundError'
  }
}

export class InvalidTransitionError extends ConflictError {
  override readonly code = 'INVALID_TRANSITION' as const
  constructor(
    public readonly from: EventStatus,
    public readonly to: EventStatus,
    message?: string
  ) {
    super(message ?? `Transición no permitida: ${from} → ${to}`)
    this.name = 'InvalidTransitionError'
  }
}

export class EventTerminalStateError extends ConflictError {
  override readonly code = 'EVENT_TERMINAL_STATE' as const
  constructor(
    public readonly status: EventStatus,
    message?: string
  ) {
    super(message ?? `El evento está en estado terminal (${status}) y no puede modificarse`)
    this.name = 'EventTerminalStateError'
  }
}

export class EventRequiresMenuError extends ValidationError {
  override readonly code = 'EVENT_REQUIRES_MENU' as const
  constructor(message = 'El evento requiere al menos un menú para ser confirmado') {
    super(message)
    this.name = 'EventRequiresMenuError'
  }
}

export class EventCancelRequiresReasonError extends ValidationError {
  override readonly code = 'EVENT_CANCEL_REQUIRES_REASON' as const
  constructor(message = 'Cancelar un evento requiere un motivo') {
    super(message)
    this.name = 'EventCancelRequiresReasonError'
  }
}
