import { z } from 'zod'
import { dateOnlySchema, formatDateOnly, toUtcStart, uuidString } from './shared'

export const REPORT_DATE_PRESETS = ['last_7_days', 'current_month'] as const
export type ReportDatePreset = (typeof REPORT_DATE_PRESETS)[number]

export const TOP_PRODUCTS_DIMENSIONS = [
  'consumed_value',
  'consumed_quantity',
  'wasted_value',
  'price_volatility',
] as const

export type TopProductsDimension = (typeof TOP_PRODUCTS_DIMENSIONS)[number]

export const TOP_PRODUCTS_DIMENSION_LABELS: Record<TopProductsDimension, string> = {
  consumed_value: 'Consumidos por valor',
  consumed_quantity: 'Consumidos por cantidad',
  wasted_value: 'Mermados por valor',
  price_volatility: 'Variación de precio',
}

export const reportDatePresetSchema = z.enum(REPORT_DATE_PRESETS)
export const topProductsDimensionSchema = z.enum(TOP_PRODUCTS_DIMENSIONS)

export const reportDateRangeSchema = z.object({
  from: dateOnlySchema,
  to: dateOnlySchema,
}).refine((value) => value.from < value.to, {
  path: ['to'],
  message: 'La fecha final debe ser posterior a la inicial',
})

export const reportBaseFilterSchema = reportDateRangeSchema.extend({
  hotelId: uuidString(),
})

export const reportProductFilterSchema = reportBaseFilterSchema.extend({
  productId: uuidString().optional(),
  categoryId: uuidString().optional(),
})

export const reportPriceChangesFilterSchema = reportBaseFilterSchema.extend({
  supplierId: uuidString().optional(),
  productId: uuidString().optional(),
})

export const reportTopProductsFilterSchema = reportBaseFilterSchema.extend({
  dimension: topProductsDimensionSchema,
  limit: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: uuidString().optional(),
})

export type ReportDateRange = z.infer<typeof reportDateRangeSchema>
export type ReportBaseFilter = z.infer<typeof reportBaseFilterSchema>
export type ReportProductFilter = z.infer<typeof reportProductFilterSchema>
export type ReportPriceChangesFilter = z.infer<typeof reportPriceChangesFilterSchema>
export type ReportTopProductsFilter = z.infer<typeof reportTopProductsFilterSchema>

export function resolveReportDatePreset(
  preset: ReportDatePreset,
  now = new Date()
): ReportDateRange {
  const current = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

  if (preset === 'current_month') {
    const from = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), 1))
    const to = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 1))
    return { from: formatDateOnly(from), to: formatDateOnly(to) }
  }

  const from = new Date(current)
  from.setUTCDate(current.getUTCDate() - 6)
  const to = new Date(current)
  to.setUTCDate(current.getUTCDate() + 1)
  return { from: formatDateOnly(from), to: formatDateOnly(to) }
}

export function reportDateRangeToRpc(range: ReportDateRange): {
  p_from: string
  p_to: string
} {
  const parsed = reportDateRangeSchema.parse(range)
  return {
    p_from: toUtcStart(parsed.from),
    p_to: toUtcStart(parsed.to),
  }
}

export function rangeFromSearchParams(searchParams: URLSearchParams): ReportDateRange {
  const fallback = resolveReportDatePreset('last_7_days')
  return reportDateRangeSchema.parse({
    from: searchParams.get('from') ?? fallback.from,
    to: searchParams.get('to') ?? fallback.to,
  })
}

export function urlSearchParamsFromRecord(
  raw: Record<string, string | string[] | undefined>
): URLSearchParams {
  const params = new URLSearchParams()
  Object.entries(raw).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const first = value[0]
      if (first) params.set(key, first)
      return
    }
    if (value) params.set(key, value)
  })
  return params
}
