'use client'

import type { ReportDateRange, TopProductsDimension } from '../domain/filters'
import type { CsvReportName } from '../infrastructure/csv-reports'

interface CsvExportOptions extends ReportDateRange {
  name: CsvReportName
  categoryId?: string
  productId?: string
  supplierId?: string
  dimension?: TopProductsDimension
}

export function buildCsvExportUrl(options: CsvExportOptions): string {
  const params = new URLSearchParams({
    from: options.from,
    to: options.to,
  })

  if (options.categoryId) params.set('categoryId', options.categoryId)
  if (options.productId) params.set('productId', options.productId)
  if (options.supplierId) params.set('supplierId', options.supplierId)
  if (options.dimension) params.set('dimension', options.dimension)

  return `/api/reports/${options.name}/export.csv?${params.toString()}`
}

export function useCsvExport(options: CsvExportOptions): string {
  return buildCsvExportUrl(options)
}
