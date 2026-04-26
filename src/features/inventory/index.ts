/**
 * Contrato público del módulo `inventory`.
 *
 * Owner: lotes FIFO, movimientos append-only, snapshot de stock y acciones
 * manuales de consumo, merma y ajuste. Los consumidores externos importan
 * desde `@/features/inventory`; `domain/`, `application/` e `infrastructure/`
 * son internals del módulo.
 */

export type {
  InventoryLot,
  InventoryLotDetail,
} from './domain/lot'

export {
  inventoryLotSchema,
  sortLotsFifo,
  validateLotConsistency,
} from './domain/lot'

export type {
  ConsumeInventoryInput,
  ConsumedLot,
  InventoryAdjustmentResult,
  InventoryConsumptionResult,
  InventoryMovement,
  InventoryMovementDetail,
  InventoryMovementKind,
  RegisterAdjustmentInput,
  RegisterWasteInput,
} from './domain/movement'

export {
  INVENTORY_MOVEMENT_KINDS,
  INVENTORY_MOVEMENT_LABELS,
  INVENTORY_MOVEMENT_VARIANT,
  calculateWeightedUnitCost,
  consumedLotSchema,
  inventoryAdjustmentResultSchema,
  inventoryConsumptionResultSchema,
  inventoryMovementSchema,
} from './domain/movement'

export type {
  InventorySnapshotFilter,
  InventorySnapshotItem,
  InventorySnapshotTotals,
} from './domain/snapshot'

export {
  filterInventorySnapshot,
  inventorySnapshotItemSchema,
  inventorySnapshotTotals,
} from './domain/snapshot'

export {
  InsufficientStockError,
  InventoryLotInconsistencyError,
  InventoryProductNotFoundError,
} from './domain/errors'

export { useInventorySnapshot } from './application/use-inventory-snapshot'
export { useProductLots } from './application/use-product-lots'
export { useProductMovements } from './application/use-product-movements'
export { useConsumeInventory } from './application/use-consume-inventory'
export { useRegisterWaste } from './application/use-register-waste'
export { useRegisterAdjustment } from './application/use-register-adjustment'
