import { ConflictError, NotFoundError } from '@/lib/errors'
import { describe, expect, it } from 'vitest'
import {
  GoodsReceiptNotFoundError,
  InvalidProcurementTransitionError,
  PurchaseOrderNotFoundError,
  PurchaseRequestNotFoundError,
} from './errors'

describe('procurement domain errors', () => {
  it('PurchaseRequestNotFoundError extiende NotFoundError y conserva requestId', () => {
    const error = new PurchaseRequestNotFoundError('pr-1')

    expect(error).toBeInstanceOf(NotFoundError)
    expect(error.code).toBe('PURCHASE_REQUEST_NOT_FOUND')
    expect(error.requestId).toBe('pr-1')
  })

  it('PurchaseOrderNotFoundError extiende NotFoundError y conserva orderId', () => {
    const error = new PurchaseOrderNotFoundError('po-1')

    expect(error).toBeInstanceOf(NotFoundError)
    expect(error.code).toBe('PURCHASE_ORDER_NOT_FOUND')
    expect(error.orderId).toBe('po-1')
  })

  it('GoodsReceiptNotFoundError extiende NotFoundError y conserva receiptId', () => {
    const error = new GoodsReceiptNotFoundError('gr-1')

    expect(error).toBeInstanceOf(NotFoundError)
    expect(error.code).toBe('GOODS_RECEIPT_NOT_FOUND')
    expect(error.receiptId).toBe('gr-1')
  })

  it('InvalidProcurementTransitionError extiende ConflictError y conserva from/to', () => {
    const error = new InvalidProcurementTransitionError('sent', 'draft')

    expect(error).toBeInstanceOf(ConflictError)
    expect(error.code).toBe('INVALID_PROCUREMENT_TRANSITION')
    expect(error.from).toBe('sent')
    expect(error.to).toBe('draft')
  })
})
