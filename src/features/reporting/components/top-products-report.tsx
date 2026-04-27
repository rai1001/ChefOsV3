'use client'

import { useMemo } from 'react'
import { useProductCategories } from '@/features/catalog'
import {
  TOP_PRODUCTS_DIMENSION_LABELS,
  TOP_PRODUCTS_DIMENSIONS,
  type ReportDateRange,
  type TopProductsDimension,
} from '../domain/filters'
import { useCsvExport } from '../application/use-csv-export'
import { useTopProductsReport } from '../application/use-top-products-report'
import {
  BarsChart,
  MetricCard,
  numberFormatter,
  QueryState,
  ReportDateFilters,
  ReportToolbar,
  TableFrame,
  UrlSelectFilter,
} from './report-ui'

export function TopProductsReport({
  hotelId,
  range,
  dimension,
  categoryId,
}: {
  hotelId: string
  range: ReportDateRange
  dimension: TopProductsDimension
  categoryId?: string
}) {
  const categories = useProductCategories(hotelId)
  const filter = useMemo(
    () => ({ hotelId, ...range, dimension, categoryId, limit: 20 }),
    [categoryId, dimension, hotelId, range]
  )
  const report = useTopProductsReport(filter)
  const rows = report.data ?? []
  const exportHref = useCsvExport({ name: 'top-products', ...range, dimension, categoryId })

  return (
    <div className="space-y-6">
      <div className="grid gap-3 lg:grid-cols-[1fr_240px]">
        <ReportDateFilters range={range} />
        <UrlSelectFilter
          label="Categoría"
          param="categoryId"
          value={categoryId ?? ''}
          options={(categories.data ?? []).map((category) => ({
            value: category.id,
            label: category.name,
          }))}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {TOP_PRODUCTS_DIMENSIONS.map((item) => (
          <a
            key={item}
            href={`?from=${range.from}&to=${range.to}&dimension=${item}${categoryId ? `&categoryId=${categoryId}` : ''}`}
            className={`rounded border px-3 py-2 text-sm ${item === dimension ? 'bg-[color:var(--color-accent)] text-[color:var(--accent-fg)]' : ''}`}
            style={{ borderColor: 'var(--color-border)' }}
          >
            {TOP_PRODUCTS_DIMENSION_LABELS[item]}
          </a>
        ))}
      </div>
      <ReportToolbar
        exportHref={exportHref}
        onRefresh={() => void report.refetch()}
        isRefreshing={report.isFetching}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <MetricCard label="Dimensión" value={TOP_PRODUCTS_DIMENSION_LABELS[dimension]} />
        <MetricCard label="Productos" value={rows.length} />
      </div>

      <QueryState
        isLoading={report.isLoading}
        error={report.error}
        empty={!report.isLoading && rows.length === 0}
      />

      {rows.length > 0 ? (
        <>
          <BarsChart
            label="Ranking"
            rows={rows.map((row) => ({
              name: row.product_name,
              value: row.metric_value,
            }))}
          />
          <TableFrame>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ background: 'var(--color-bg-sidebar)' }}>
                  <th className="kpi-label px-3 py-2">Rank</th>
                  <th className="kpi-label px-3 py-2">Producto</th>
                  <th className="kpi-label px-3 py-2">Métrica</th>
                  <th className="kpi-label px-3 py-2">Secundaria</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.product_id}-${row.rank}`} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <td className="px-3 py-2 font-data">{row.rank}</td>
                    <td className="px-3 py-2 font-medium">{row.product_name}</td>
                    <td className="px-3 py-2 font-data">{numberFormatter.format(row.metric_value)}</td>
                    <td className="px-3 py-2 font-data">{numberFormatter.format(row.metric_secondary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableFrame>
        </>
      ) : null}
    </div>
  )
}
