import { describe, expect, it } from 'vitest'
import {
  REPORT_DATE_PRESETS,
  reportDateRangeSchema,
  resolveReportDatePreset,
  topProductsDimensionSchema,
} from './filters'

describe('reporting filters', () => {
  it('valida rangos YYYY-MM-DD y normaliza a timestamptz UTC', () => {
    const parsed = reportDateRangeSchema.parse({
      from: '2026-04-01',
      to: '2026-04-30',
    })

    expect(parsed.from).toBe('2026-04-01')
    expect(parsed.to).toBe('2026-04-30')
  })

  it('rechaza dimensiones no permitidas para top products', () => {
    expect(() => topProductsDimensionSchema.parse('drop table')).toThrow()
    expect(topProductsDimensionSchema.parse('consumed_value')).toBe('consumed_value')
  })

  it('resuelve presets soportados', () => {
    const range = resolveReportDatePreset('last_7_days', new Date('2026-04-27T12:00:00.000Z'))

    expect(REPORT_DATE_PRESETS).toContain('last_7_days')
    expect(range).toEqual({
      from: '2026-04-21',
      to: '2026-04-28',
    })
  })
})
