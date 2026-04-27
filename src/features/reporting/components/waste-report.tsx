'use client'

import { useMemo } from 'react'
import { useProductCategories } from '@/features/catalog'
import type { ReportDateRange } from '../domain/filters'
import { wasteTotals } from '../domain/waste'
import { useCsvExport } from '../application/use-csv-export'
import { useWasteReport } from '../application/use-waste-report'
import {
  BarsChart,
  currencyFormatter,
  MetricCard,
  numberFormatter,
  percentFormatter,
  QueryState,
  ReportDateFilters,
  ReportToolbar,
  TableFrame,
  UrlSelectFilter,
} from './report-ui'

export function WasteReport({
  hotelId,
  range,
  categoryId,
}: {
  hotelId: string
  range: ReportDateRange
  categoryId?: string
}) {
  const categories = useProductCategories(hotelId)
  const filter = useMemo(
    () => ({ hotelId, ...range, categoryId }),
    [categoryId, hotelId, range]
  )
  const report = useWasteReport(filter)
  const rows = report.data ?? []
  const totals = wasteTotals(rows)
  const exportHref = useCsvExport({ name: 'waste', ...range, categoryId })

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
      <ReportToolbar
        exportHref={exportHref}
        onRefresh={() => void report.refetch()}
        isRefreshing={report.isFetching}
      />

      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Cantidad" value={numberFormatter.format(totals.quantity)} />
        <MetricCard label="Coste merma" value={currencyFormatter.format(totals.cost)} />
        <MetricCard label="Movimientos" value={totals.movements} />
      </div>

      <QueryState
        isLoading={report.isLoading}
        error={report.error}
        empty={!report.isLoading && rows.length === 0}
      />

      {rows.length > 0 ? (
        <>
          <BarsChart
            label="Top 10 por coste"
            rows={rows.map((row) => ({
              name: row.product_name,
              value: row.total_cost_wasted,
            }))}
          />
          <TableFrame>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ background: 'var(--color-bg-sidebar)' }}>
                  <th className="kpi-label px-3 py-2">Producto</th>
                  <th className="kpi-label px-3 py-2">Cantidad</th>
                  <th className="kpi-label px-3 py-2">Coste</th>
                  <th className="kpi-label px-3 py-2">Movs.</th>
                  <th className="kpi-label px-3 py-2">% sobre consumo</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.product_id} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <td className="px-3 py-2 font-medium">{row.product_name}</td>
                    <td className="px-3 py-2 font-data">{numberFormatter.format(row.total_quantity_wasted)}</td>
                    <td className="px-3 py-2 font-data">{currencyFormatter.format(row.total_cost_wasted)}</td>
                    <td className="px-3 py-2 font-data">{row.movements_count}</td>
                    <td className="px-3 py-2 font-data">
                      {row.pct_of_consume === null ? '-' : `${percentFormatter.format(row.pct_of_consume)}%`}
                    </td>
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
