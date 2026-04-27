import { ConflictError, NotFoundError } from '@/lib/errors'
import type { ProductionDeficit } from './feasibility'

export class ProductionOrderNotFoundError extends NotFoundError {
  override readonly code = 'PRODUCTION_ORDER_NOT_FOUND' as const

  constructor(
    public readonly orderId: string,
    message?: string
  ) {
    super('ProductionOrder', message ?? `Production order not found: ${orderId}`)
    this.name = 'ProductionOrderNotFoundError'
  }
}

export class ProductionInsufficientStockError extends ConflictError {
  override readonly code = 'PRODUCTION_INSUFFICIENT_STOCK' as const

  constructor(
    public readonly deficits: ProductionDeficit[],
    message = 'Stock insuficiente para iniciar la producción'
  ) {
    super(message)
    this.name = 'ProductionInsufficientStockError'
  }
}

export class ProductionInvalidStateError extends ConflictError {
  override readonly code = 'PRODUCTION_INVALID_STATE' as const

  constructor(
    public readonly from: string,
    public readonly to: string,
    message?: string
  ) {
    super(message ?? `Invalid production transition: ${from} -> ${to}`)
    this.name = 'ProductionInvalidStateError'
  }
}
