import { ConflictError, NotFoundError, ValidationError } from '@/lib/errors'

export class InsufficientStockError extends ConflictError {
  override readonly code = 'INSUFFICIENT_STOCK' as const

  constructor(
    public readonly productId: string,
    message?: string
  ) {
    super(message ?? `Stock insuficiente para el producto: ${productId}`)
    this.name = 'InsufficientStockError'
  }
}

export class InventoryProductNotFoundError extends NotFoundError {
  override readonly code = 'INVENTORY_PRODUCT_NOT_FOUND' as const

  constructor(
    public readonly productId: string,
    message?: string
  ) {
    super('InventoryProduct', message ?? `Inventory product not found: ${productId}`)
    this.name = 'InventoryProductNotFoundError'
  }
}

export class InventoryLotInconsistencyError extends ValidationError {
  override readonly code = 'INVENTORY_LOT_INCONSISTENCY' as const

  constructor(
    public readonly lotId: string,
    message?: string
  ) {
    super(message ?? `Inventory lot inconsistency: ${lotId}`)
    this.name = 'InventoryLotInconsistencyError'
  }
}
