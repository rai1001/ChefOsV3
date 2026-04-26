export class PurchaseRequestNotFoundError extends Error {
  constructor(id: string) {
    super(`Purchase request not found: ${id}`)
    this.name = 'PurchaseRequestNotFoundError'
  }
}

export class PurchaseOrderNotFoundError extends Error {
  constructor(id: string) {
    super(`Purchase order not found: ${id}`)
    this.name = 'PurchaseOrderNotFoundError'
  }
}

export class InvalidProcurementTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Invalid procurement transition: ${from} -> ${to}`)
    this.name = 'InvalidProcurementTransitionError'
  }
}
