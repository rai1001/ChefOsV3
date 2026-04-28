export type {
  StockByWarehouseInput,
  TransferLotInput,
  TransferLotResult,
  UpdateWarehouseInput,
  WarehouseIdInput,
  WarehouseInput,
} from './domain/schemas'

export {
  createWarehouseSchema,
  stockByWarehouseInputSchema,
  transferLotResultSchema,
  transferLotSchema,
  updateWarehouseSchema,
  warehouseIdInputSchema,
  warehouseSchema,
  warehouseStockItemSchema,
} from './domain/schemas'

export type { Warehouse, WarehouseFilter, WarehouseStockItem, WarehouseType } from './domain/types'
export { WAREHOUSE_TYPE_LABELS, WAREHOUSE_TYPES } from './domain/types'
export { canArchiveWarehouse } from './domain/invariants'
export {
  DefaultWarehouseRequiredError,
  TransferQuantityExceededError,
  WarehouseHasActiveStockError,
  WarehouseNotFoundError,
} from './domain/errors'

export {
  useArchiveWarehouse,
  useCreateWarehouse,
  useSetDefaultWarehouse,
  useUpdateWarehouse,
  useWarehouse,
  useWarehouses,
} from './application/use-warehouses'
export { useStockByWarehouse } from './application/use-stock-by-warehouse'
export { useTransferLot } from './application/use-transfer-lot'
