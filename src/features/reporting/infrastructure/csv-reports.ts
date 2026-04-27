import type { FoodCostReportRow } from '../domain/food-cost'
import type { PriceChangeReportRow } from '../domain/price-changes'
import type { TopProductReportRow } from '../domain/top-products'
import type { WasteReportRow } from '../domain/waste'
import { formatCsv, type CsvColumn } from './csv'

export type CsvReportName =
  | 'food-cost'
  | 'waste'
  | 'top-products'
  | 'price-changes'

export const CSV_REPORT_NAMES: readonly CsvReportName[] = [
  'food-cost',
  'waste',
  'top-products',
  'price-changes',
]

export function isCsvReportName(name: string): name is CsvReportName {
  return CSV_REPORT_NAMES.includes(name as CsvReportName)
}

export const foodCostCsvColumns: CsvColumn<FoodCostReportRow>[] = [
  { key: 'recipe_id', header: 'recipe_id' },
  { key: 'recipe_name', header: 'recipe_name' },
  { key: 'production_orders_count', header: 'production_orders_count' },
  { key: 'total_servings_produced', header: 'total_servings_produced' },
  { key: 'total_estimated_cost', header: 'total_estimated_cost' },
  { key: 'total_actual_cost', header: 'total_actual_cost' },
  { key: 'cost_variance_pct', header: 'cost_variance_pct' },
  { key: 'avg_actual_cost_per_serving', header: 'avg_actual_cost_per_serving' },
]

export const wasteCsvColumns: CsvColumn<WasteReportRow>[] = [
  { key: 'product_id', header: 'product_id' },
  { key: 'product_name', header: 'product_name' },
  { key: 'category_id', header: 'category_id' },
  { key: 'total_quantity_wasted', header: 'total_quantity_wasted' },
  { key: 'total_cost_wasted', header: 'total_cost_wasted' },
  { key: 'movements_count', header: 'movements_count' },
  { key: 'pct_of_consume', header: 'pct_of_consume' },
]

export const topProductsCsvColumns: CsvColumn<TopProductReportRow>[] = [
  { key: 'rank', header: 'rank' },
  { key: 'product_id', header: 'product_id' },
  { key: 'product_name', header: 'product_name' },
  { key: 'category_id', header: 'category_id' },
  { key: 'metric_value', header: 'metric_value' },
  { key: 'metric_secondary', header: 'metric_secondary' },
]

export const priceChangesCsvColumns: CsvColumn<PriceChangeReportRow>[] = [
  { key: 'price_change_id', header: 'price_change_id' },
  { key: 'product_id', header: 'product_id' },
  { key: 'product_name', header: 'product_name' },
  { key: 'supplier_id', header: 'supplier_id' },
  { key: 'supplier_name', header: 'supplier_name' },
  { key: 'purchase_order_line_id', header: 'purchase_order_line_id' },
  { key: 'old_price', header: 'old_price' },
  { key: 'new_price', header: 'new_price' },
  { key: 'delta_pct', header: 'delta_pct' },
  { key: 'source', header: 'source' },
  { key: 'detected_at', header: 'detected_at' },
  { key: 'created_at', header: 'created_at' },
]

export function formatFoodCostCsv(rows: FoodCostReportRow[]): string {
  return formatCsv({ columns: foodCostCsvColumns, rows })
}

export function formatWasteCsv(rows: WasteReportRow[]): string {
  return formatCsv({ columns: wasteCsvColumns, rows })
}

export function formatTopProductsCsv(rows: TopProductReportRow[]): string {
  return formatCsv({ columns: topProductsCsvColumns, rows })
}

export function formatPriceChangesCsv(rows: PriceChangeReportRow[]): string {
  return formatCsv({ columns: priceChangesCsvColumns, rows })
}
