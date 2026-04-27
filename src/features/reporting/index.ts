export type {
  ReportBaseFilter,
  ReportDatePreset,
  ReportDateRange,
  ReportPriceChangesFilter,
  ReportProductFilter,
  ReportTopProductsFilter,
  TopProductsDimension,
} from './domain/filters'

export {
  REPORT_DATE_PRESETS,
  TOP_PRODUCTS_DIMENSION_LABELS,
  TOP_PRODUCTS_DIMENSIONS,
  rangeFromSearchParams,
  reportDateRangeSchema,
  resolveReportDatePreset,
  topProductsDimensionSchema,
  urlSearchParamsFromRecord,
} from './domain/filters'

export type { FoodCostReportRow } from './domain/food-cost'
export { foodCostReportSchema, foodCostTotals } from './domain/food-cost'

export type { WasteReportRow } from './domain/waste'
export { wasteReportSchema, wasteTotals } from './domain/waste'

export type { TopProductReportRow } from './domain/top-products'
export { topProductsReportSchema } from './domain/top-products'

export type { PriceChangeReportRow } from './domain/price-changes'
export { priceChangesReportSchema, priceChangesSummary } from './domain/price-changes'

export type { DeadStockRow, ExpiringLot, StockHealthReport } from './domain/stock-health'
export { stockHealthReportSchema } from './domain/stock-health'

export { ReportInvalidDimensionError } from './domain/errors'

export { useFoodCostReport } from './application/use-food-cost-report'
export { useWasteReport } from './application/use-waste-report'
export { useTopProductsReport } from './application/use-top-products-report'
export { usePriceChangesReport } from './application/use-price-changes-report'
export { useStockHealthReport } from './application/use-stock-health-report'
export { buildCsvExportUrl, useCsvExport } from './application/use-csv-export'
