export class WarehouseNotFoundError extends Error {
  constructor(warehouseId: string, message = 'Almacén no encontrado') {
    super(message)
    this.name = 'WarehouseNotFoundError'
    this.warehouseId = warehouseId
  }

  readonly warehouseId: string
}

export class DefaultWarehouseRequiredError extends Error {
  constructor(message = 'El almacén principal es obligatorio') {
    super(message)
    this.name = 'DefaultWarehouseRequiredError'
  }
}

export class WarehouseHasActiveStockError extends Error {
  constructor(message = 'No se puede archivar un almacén con stock activo') {
    super(message)
    this.name = 'WarehouseHasActiveStockError'
  }
}

export class TransferQuantityExceededError extends Error {
  constructor(message = 'La cantidad a transferir supera el stock disponible') {
    super(message)
    this.name = 'TransferQuantityExceededError'
  }
}
