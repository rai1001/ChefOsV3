import { ConflictError, NotFoundError, RateLimitedError } from '@/lib/errors'

export class PurchaseRequestNotFoundError extends NotFoundError {
  override readonly code = 'PURCHASE_REQUEST_NOT_FOUND' as const

  constructor(
    public readonly requestId: string,
    message?: string
  ) {
    super('PurchaseRequest', message ?? `Purchase request not found: ${requestId}`)
    this.name = 'PurchaseRequestNotFoundError'
  }
}

export class PurchaseOrderNotFoundError extends NotFoundError {
  override readonly code = 'PURCHASE_ORDER_NOT_FOUND' as const

  constructor(
    public readonly orderId: string,
    message?: string
  ) {
    super('PurchaseOrder', message ?? `Purchase order not found: ${orderId}`)
    this.name = 'PurchaseOrderNotFoundError'
  }
}

export class GoodsReceiptNotFoundError extends NotFoundError {
  override readonly code = 'GOODS_RECEIPT_NOT_FOUND' as const

  constructor(
    public readonly receiptId: string,
    message?: string
  ) {
    super('GoodsReceipt', message ?? `Goods receipt not found: ${receiptId}`)
    this.name = 'GoodsReceiptNotFoundError'
  }
}

export class InvalidProcurementTransitionError extends ConflictError {
  override readonly code = 'INVALID_PROCUREMENT_TRANSITION' as const

  constructor(
    public readonly from: string,
    public readonly to: string,
    message?: string
  ) {
    super(message ?? `Invalid procurement transition: ${from} -> ${to}`)
    this.name = 'InvalidProcurementTransitionError'
  }
}

export class OcrJobNotFoundError extends NotFoundError {
  override readonly code = 'OCR_JOB_NOT_FOUND' as const

  constructor(
    public readonly jobId: string,
    message?: string
  ) {
    super('OcrJob', message ?? `OCR job not found: ${jobId}`)
    this.name = 'OcrJobNotFoundError'
  }
}

export class OcrJobInvalidStateError extends ConflictError {
  override readonly code = 'OCR_JOB_INVALID_STATE' as const

  constructor(
    public readonly currentStatus: string,
    public readonly expectedStatus: string,
    message?: string
  ) {
    super(
      message ??
        `OCR job invalid state: expected ${expectedStatus}, got ${currentStatus}`
    )
    this.name = 'OcrJobInvalidStateError'
  }
}

export class OcrJobAlreadyAppliedError extends ConflictError {
  override readonly code = 'OCR_JOB_ALREADY_APPLIED' as const

  constructor(
    public readonly jobId: string,
    public readonly goodsReceiptId: string,
    message?: string
  ) {
    super(message ?? `OCR job already applied: ${jobId}`)
    this.name = 'OcrJobAlreadyAppliedError'
  }
}

export class OcrRateLimitError extends RateLimitedError {
  override readonly code = 'OCR_RATE_LIMITED' as const

  constructor(retryAfterSeconds?: number, message?: string) {
    super(message ?? 'Demasiadas extracciones OCR para este hotel', retryAfterSeconds)
    this.name = 'OcrRateLimitError'
  }
}
