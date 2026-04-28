import { z } from 'zod'
import { dateOnlySchema, formatDateOnly, toUtcStart, uuidString } from './shared'

export const COMPLIANCE_DATE_PRESETS = ['today', 'last_7_days', 'current_month'] as const
export type ComplianceDatePreset = (typeof COMPLIANCE_DATE_PRESETS)[number]

export const complianceDatePresetSchema = z.enum(COMPLIANCE_DATE_PRESETS)

export const complianceDateRangeSchema = z.object({
  from: dateOnlySchema,
  to: dateOnlySchema,
}).refine((value) => value.from < value.to, {
  path: ['to'],
  message: 'La fecha final debe ser posterior a la inicial',
})

export const complianceBaseFilterSchema = complianceDateRangeSchema.extend({
  hotelId: uuidString(),
})

export type ComplianceDateRange = z.infer<typeof complianceDateRangeSchema>
export type ComplianceBaseFilter = z.infer<typeof complianceBaseFilterSchema>

export function resolveComplianceDatePreset(
  preset: ComplianceDatePreset,
  now = new Date()
): ComplianceDateRange {
  const current = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

  if (preset === 'current_month') {
    const from = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), 1))
    const to = new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 1))
    return { from: formatDateOnly(from), to: formatDateOnly(to) }
  }

  if (preset === 'last_7_days') {
    const from = new Date(current)
    from.setUTCDate(current.getUTCDate() - 6)
    const to = new Date(current)
    to.setUTCDate(current.getUTCDate() + 1)
    return { from: formatDateOnly(from), to: formatDateOnly(to) }
  }

  const to = new Date(current)
  to.setUTCDate(current.getUTCDate() + 1)
  return { from: formatDateOnly(current), to: formatDateOnly(to) }
}

export function complianceDateRangeToRpc(range: ComplianceDateRange): {
  p_from: string
  p_to: string
} {
  const parsed = complianceDateRangeSchema.parse(range)
  return {
    p_from: toUtcStart(parsed.from),
    p_to: toUtcStart(parsed.to),
  }
}

export function rangeFromSearchParams(searchParams: URLSearchParams): ComplianceDateRange {
  const fallback = resolveComplianceDatePreset('last_7_days')
  return complianceDateRangeSchema.parse({
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

