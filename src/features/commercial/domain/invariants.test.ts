import { describe, it, expect } from 'vitest'
import {
  canTransition,
  canConfirmEvent,
  getValidNextStatuses,
  isEventLocked,
  isTerminalStatus,
  requiresCancelReason,
  EVENT_STATUS_LABELS,
  EVENT_STATUS_VARIANT,
  EVENT_TYPE_LABELS,
  SERVICE_TYPE_LABELS,
  VIP_LEVEL_LABELS,
  VALID_TRANSITIONS,
} from './invariants'
import { EVENT_STATUSES, EVENT_TYPES, SERVICE_TYPES, VIP_LEVELS } from './types'

describe('canTransition', () => {
  it('draft → pending_confirmation permitido', () => {
    expect(canTransition('draft', 'pending_confirmation')).toBe(true)
  })

  it('draft → confirmed NO permitido (salta pending_confirmation)', () => {
    expect(canTransition('draft', 'confirmed')).toBe(false)
  })

  it('pending_confirmation → confirmed permitido', () => {
    expect(canTransition('pending_confirmation', 'confirmed')).toBe(true)
  })

  it('pending_confirmation → draft permitido (vuelta atrás)', () => {
    expect(canTransition('pending_confirmation', 'draft')).toBe(true)
  })

  it('confirmed → in_preparation permitido', () => {
    expect(canTransition('confirmed', 'in_preparation')).toBe(true)
  })

  it('completed → archived permitido', () => {
    expect(canTransition('completed', 'archived')).toBe(true)
  })

  it('archived no tiene salidas', () => {
    expect(getValidNextStatuses('archived')).toEqual([])
  })

  it('cualquier estado puede ir a cancelled excepto terminales', () => {
    expect(canTransition('draft', 'cancelled')).toBe(true)
    expect(canTransition('pending_confirmation', 'cancelled')).toBe(true)
    expect(canTransition('confirmed', 'cancelled')).toBe(true)
    expect(canTransition('in_preparation', 'cancelled')).toBe(true)
    expect(canTransition('in_operation', 'cancelled')).toBe(true)
  })

  it('cancelled → archived permitido, pero no vuelta a activo', () => {
    expect(canTransition('cancelled', 'archived')).toBe(true)
    expect(canTransition('cancelled', 'draft')).toBe(false)
  })
})

describe('isTerminalStatus', () => {
  it('completed, archived, cancelled son terminales', () => {
    expect(isTerminalStatus('completed')).toBe(true)
    expect(isTerminalStatus('archived')).toBe(true)
    expect(isTerminalStatus('cancelled')).toBe(true)
  })

  it('draft, pending_confirmation, confirmed NO son terminales', () => {
    expect(isTerminalStatus('draft')).toBe(false)
    expect(isTerminalStatus('pending_confirmation')).toBe(false)
    expect(isTerminalStatus('confirmed')).toBe(false)
  })
})

describe('isEventLocked', () => {
  it('bloquea estados terminales', () => {
    expect(isEventLocked('completed')).toBe(true)
    expect(isEventLocked('cancelled')).toBe(true)
    expect(isEventLocked('archived')).toBe(true)
  })

  it('no bloquea estados activos', () => {
    expect(isEventLocked('draft')).toBe(false)
    expect(isEventLocked('in_operation')).toBe(false)
  })
})

describe('canConfirmEvent', () => {
  it('requiere al menos 1 menú', () => {
    expect(canConfirmEvent(0)).toBe(false)
    expect(canConfirmEvent(1)).toBe(true)
    expect(canConfirmEvent(5)).toBe(true)
  })
})

describe('requiresCancelReason', () => {
  it('motivo vacío o nulo rechazado', () => {
    expect(requiresCancelReason(null)).toBe(false)
    expect(requiresCancelReason(undefined)).toBe(false)
    expect(requiresCancelReason('')).toBe(false)
    expect(requiresCancelReason('   ')).toBe(false)
  })

  it('motivo no-vacío aceptado', () => {
    expect(requiresCancelReason('Cliente canceló')).toBe(true)
  })
})

describe('Labels & variants', () => {
  it('todos los EVENT_STATUSES tienen label y variant', () => {
    EVENT_STATUSES.forEach((s) => {
      expect(EVENT_STATUS_LABELS[s]).toBeDefined()
      expect(EVENT_STATUS_VARIANT[s]).toBeDefined()
    })
  })

  it('todos los EVENT_TYPES tienen label', () => {
    EVENT_TYPES.forEach((t) => {
      expect(EVENT_TYPE_LABELS[t]).toBeDefined()
    })
  })

  it('todos los SERVICE_TYPES tienen label', () => {
    SERVICE_TYPES.forEach((s) => {
      expect(SERVICE_TYPE_LABELS[s]).toBeDefined()
    })
  })

  it('todos los VIP_LEVELS tienen label', () => {
    VIP_LEVELS.forEach((v) => {
      expect(VIP_LEVEL_LABELS[v]).toBeDefined()
    })
  })

  it('VALID_TRANSITIONS cubre todos los estados', () => {
    EVENT_STATUSES.forEach((s) => {
      expect(VALID_TRANSITIONS[s]).toBeDefined()
    })
  })
})
