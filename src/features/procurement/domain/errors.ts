import { ConflictError, NotFoundError } from '@/lib/errors'

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
