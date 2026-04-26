import { ConflictError, NotFoundError, RateLimitedError } from '@/lib/errors'
import { describe, expect, it } from 'vitest'
import {
  GoodsReceiptNotFoundError,
  InvalidProcurementTransitionError,
  OcrJobAlreadyAppliedError,
  OcrJobInvalidStateError,
  OcrJobNotFoundError,
  OcrRateLimitError,
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

  it('OcrJobNotFoundError extiende NotFoundError y conserva jobId', () => {
    const error = new OcrJobNotFoundError('job-1')

    expect(error).toBeInstanceOf(NotFoundError)
    expect(error.code).toBe('OCR_JOB_NOT_FOUND')
    expect(error.jobId).toBe('job-1')
  })

  it('OcrJobInvalidStateError extiende ConflictError y conserva status', () => {
    const error = new OcrJobInvalidStateError('pending', 'reviewed')

    expect(error).toBeInstanceOf(ConflictError)
    expect(error.code).toBe('OCR_JOB_INVALID_STATE')
    expect(error.currentStatus).toBe('pending')
    expect(error.expectedStatus).toBe('reviewed')
  })

  it('OcrJobAlreadyAppliedError extiende ConflictError y conserva receiptId', () => {
    const error = new OcrJobAlreadyAppliedError('job-1', 'gr-1')

    expect(error).toBeInstanceOf(ConflictError)
    expect(error.code).toBe('OCR_JOB_ALREADY_APPLIED')
    expect(error.jobId).toBe('job-1')
    expect(error.goodsReceiptId).toBe('gr-1')
  })

  it('OcrRateLimitError extiende RateLimitedError y conserva retryAfterSeconds', () => {
    const error = new OcrRateLimitError(3600)

    expect(error).toBeInstanceOf(RateLimitedError)
    expect(error.code).toBe('OCR_RATE_LIMITED')
    expect(error.retryAfterSeconds).toBe(3600)
  })
})
