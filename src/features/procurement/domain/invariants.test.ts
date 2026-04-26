import { describe, expect, it } from 'vitest'
import {
  PR_STATUS_LABELS,
  PO_STATUS_LABELS,
  canTransitionPO,
  canTransitionPR,
  getPendingQuantity,
  groupPurchaseOrderLinesBySupplier,
  isTerminalPOStatus,
  isTerminalPRStatus,
} from './invariants'
import { PO_STATUSES, PR_STATUSES } from './types'

describe('canTransitionPR', () => {
  it('permite draft -> approved', () => {
    expect(canTransitionPR('draft', 'approved')).toBe(true)
  })

  it('permite approved -> consolidated', () => {
    expect(canTransitionPR('approved', 'consolidated')).toBe(true)
  })

  it('rechaza consolidated -> approved', () => {
    expect(canTransitionPR('consolidated', 'approved')).toBe(false)
  })
})

describe('canTransitionPO', () => {
  it('permite draft -> sent', () => {
    expect(canTransitionPO('draft', 'sent')).toBe(true)
  })

  it('permite sent -> received_partial', () => {
    expect(canTransitionPO('sent', 'received_partial')).toBe(true)
  })

  it('rechaza closed -> sent', () => {
    expect(canTransitionPO('closed', 'sent')).toBe(false)
  })
})

describe('terminal statuses', () => {
  it('marca PR consolidated y cancelled como terminales', () => {
    expect(isTerminalPRStatus('consolidated')).toBe(true)
    expect(isTerminalPRStatus('cancelled')).toBe(true)
    expect(isTerminalPRStatus('approved')).toBe(false)
  })

  it('marca PO closed y cancelled como terminales', () => {
    expect(isTerminalPOStatus('closed')).toBe(true)
    expect(isTerminalPOStatus('cancelled')).toBe(true)
    expect(isTerminalPOStatus('sent')).toBe(false)
  })
})

describe('getPendingQuantity', () => {
  it('devuelve la cantidad pendiente', () => {
    expect(getPendingQuantity({ quantity_ordered: 10, quantity_received: 3 })).toBe(7)
  })

  it('no devuelve negativos si la recepción supera el pedido', () => {
    expect(getPendingQuantity({ quantity_ordered: 5, quantity_received: 6 })).toBe(0)
  })
})

describe('groupPurchaseOrderLinesBySupplier', () => {
  it('agrupa líneas por proveedor', () => {
    const grouped = groupPurchaseOrderLinesBySupplier([
      { id: 'l1', supplier_id: 's1' },
      { id: 'l2', supplier_id: 's2' },
      { id: 'l3', supplier_id: 's1' },
    ])

    expect(grouped.s1?.map((line) => line.id)).toEqual(['l1', 'l3'])
    expect(grouped.s2?.map((line) => line.id)).toEqual(['l2'])
  })
})

describe('labels', () => {
  it('cubre todos los estados PR', () => {
    PR_STATUSES.forEach((status) => {
      expect(PR_STATUS_LABELS[status]).toBeDefined()
    })
  })

  it('cubre todos los estados PO', () => {
    PO_STATUSES.forEach((status) => {
      expect(PO_STATUS_LABELS[status]).toBeDefined()
    })
  })
})
