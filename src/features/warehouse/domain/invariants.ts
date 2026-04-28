import type { Warehouse } from './types'

export function canArchiveWarehouse(
  warehouse: Pick<Warehouse, 'is_default'>,
  activeStockQuantity: number
): boolean {
  return !warehouse.is_default && activeStockQuantity <= 0
}
