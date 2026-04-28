export const WAREHOUSE_TYPES = [
  'main',
  'cold',
  'frozen',
  'dry',
  'catering',
  'production_kitchen',
  'other',
] as const

export type WarehouseType = (typeof WAREHOUSE_TYPES)[number]

export const WAREHOUSE_TYPE_LABELS: Record<WarehouseType, string> = {
  main: 'Principal',
  cold: 'Cocina fría',
  frozen: 'Congelador',
  dry: 'Economato seco',
  catering: 'Catering eventos',
  production_kitchen: 'Cocina producción',
  other: 'Otro',
}

export interface Warehouse {
  id: string
  hotel_id: string
  name: string
  warehouse_type: WarehouseType
  is_default: boolean
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface WarehouseStockItem {
  warehouse_id: string
  warehouse_name: string
  product_id: string
  product_name: string
  unit_id: string
  unit_abbreviation: string
  quantity_remaining: number
  unit_cost_avg: number
}

export interface WarehouseFilter {
  hotelId: string
  activeOnly?: boolean
  search?: string
}
