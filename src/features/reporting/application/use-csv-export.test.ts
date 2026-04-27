import { describe, expect, it } from 'vitest'
import { buildCsvExportUrl } from './use-csv-export'

describe('buildCsvExportUrl', () => {
  it('construye url de export con filtros opcionales', () => {
    expect(
      buildCsvExportUrl({
        name: 'top-products',
        from: '2026-04-01',
        to: '2026-05-01',
        dimension: 'wasted_value',
        categoryId: '11111111-1111-4111-8111-111111111111',
      })
    ).toBe(
      '/api/reports/top-products/export.csv?from=2026-04-01&to=2026-05-01&categoryId=11111111-1111-4111-8111-111111111111&dimension=wasted_value'
    )
  })
})
