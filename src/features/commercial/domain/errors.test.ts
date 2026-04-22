import { describe, it, expect } from 'vitest'
import {
  ClientNotFoundError,
  EventCancelRequiresReasonError,
  EventNotFoundError,
  EventRequiresMenuError,
  EventTerminalStateError,
  InvalidTransitionError,
} from './errors'

describe('commercial domain errors', () => {
  it('EventNotFoundError lleva código y eventId', () => {
    const e = new EventNotFoundError('abc-123')
    expect(e.code).toBe('EVENT_NOT_FOUND')
    expect(e.eventId).toBe('abc-123')
    expect(e.message).toContain('abc-123')
  })

  it('ClientNotFoundError lleva código y clientId', () => {
    const e = new ClientNotFoundError('cli-42')
    expect(e.code).toBe('CLIENT_NOT_FOUND')
    expect(e.clientId).toBe('cli-42')
  })

  it('InvalidTransitionError retiene from/to', () => {
    const e = new InvalidTransitionError('draft', 'completed')
    expect(e.code).toBe('INVALID_TRANSITION')
    expect(e.from).toBe('draft')
    expect(e.to).toBe('completed')
    expect(e.message).toContain('draft')
    expect(e.message).toContain('completed')
  })

  it('EventTerminalStateError retiene status', () => {
    const e = new EventTerminalStateError('archived')
    expect(e.code).toBe('EVENT_TERMINAL_STATE')
    expect(e.status).toBe('archived')
  })

  it('EventRequiresMenuError mensaje por defecto explícito', () => {
    const e = new EventRequiresMenuError()
    expect(e.code).toBe('EVENT_REQUIRES_MENU')
    expect(e.message).toMatch(/men[uú]/i)
  })

  it('EventCancelRequiresReasonError mensaje por defecto explícito', () => {
    const e = new EventCancelRequiresReasonError()
    expect(e.code).toBe('EVENT_CANCEL_REQUIRES_REASON')
    expect(e.message).toMatch(/motivo/i)
  })
})
