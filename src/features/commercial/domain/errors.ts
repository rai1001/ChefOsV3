import type { EventStatus } from './types'

export class EventNotFoundError extends Error {
  readonly code = 'EVENT_NOT_FOUND' as const
  constructor(
    public readonly eventId: string,
    message?: string
  ) {
    super(message ?? `Evento no encontrado: ${eventId}`)
    this.name = 'EventNotFoundError'
  }
}

export class ClientNotFoundError extends Error {
  readonly code = 'CLIENT_NOT_FOUND' as const
  constructor(
    public readonly clientId: string,
    message?: string
  ) {
    super(message ?? `Cliente no encontrado: ${clientId}`)
    this.name = 'ClientNotFoundError'
  }
}

export class InvalidTransitionError extends Error {
  readonly code = 'INVALID_TRANSITION' as const
  constructor(
    public readonly from: EventStatus,
    public readonly to: EventStatus,
    message?: string
  ) {
    super(message ?? `Transición no permitida: ${from} → ${to}`)
    this.name = 'InvalidTransitionError'
  }
}

export class EventTerminalStateError extends Error {
  readonly code = 'EVENT_TERMINAL_STATE' as const
  constructor(
    public readonly status: EventStatus,
    message?: string
  ) {
    super(message ?? `El evento está en estado terminal (${status}) y no puede modificarse`)
    this.name = 'EventTerminalStateError'
  }
}

export class EventRequiresMenuError extends Error {
  readonly code = 'EVENT_REQUIRES_MENU' as const
  constructor(message = 'El evento requiere al menos un menú para ser confirmado') {
    super(message)
    this.name = 'EventRequiresMenuError'
  }
}

export class EventCancelRequiresReasonError extends Error {
  readonly code = 'EVENT_CANCEL_REQUIRES_REASON' as const
  constructor(message = 'Cancelar un evento requiere un motivo') {
    super(message)
    this.name = 'EventCancelRequiresReasonError'
  }
}
