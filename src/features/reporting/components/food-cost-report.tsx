'use client'

import { useMemo } from 'react'
import type { ReportDateRange } from '../domain/filters'
import { foodCostTotals } from '../domain/food-cost'
import { useCsvExport } from '../application/use-csv-export'
import { useFoodCostReport } from '../application/use-food-cost-report'
import {
  currencyFormatter,
  LineChart,
  MetricCard,
  numberFormatter,
  percentFormatter,
  QueryState,
  ReportDateFilters,
  ReportToolbar,
  TableFrame,
} from './report-ui'

export function FoodCostReport({
  hotelId,
  range,
}: {
  hotelId: string
  range: ReportDateRange
}) {
  const filter = useMemo(() => ({ hotelId, ...range }), [hotelId, range])
  const report = useFoodCostReport(filter)
  const rows = report.data ?? []
  const totals = foodCostTotals(rows)
  const exportHref = useCsvExport({ name: 'food-cost', ...range })

  return (
    <div className="space-y-6">
      <ReportDateFilters range={range} />
      <ReportToolbar
        exportHref={exportHref}
        onRefresh={() => void report.refetch()}
        isRefreshing={report.isFetching}
      />

      <div className="grid gap-3 md:grid-cols-4">
        <MetricCard label="Órdenes" value={totals.orders} />
        <MetricCard label="Raciones" value={numberFormatter.format(totals.servings)} />
        <MetricCard label="Coste real" value={currencyFormatter.format(totals.actualCost)} />
        <MetricCard
          label="Variación"
          value={totals.variancePct === null ? '-' : `${percentFormatter.format(totals.variancePct)}%`}
        />
      </div>

      <QueryState
        isLoading={report.isLoading}
        error={report.error}
        empty={!report.isLoading && rows.length === 0}
      />

      {rows.length > 0 ? (
        <>
          <LineChart
            label="Variación vs estimado"
            values={rows.map((row) => ({
              label: row.recipe_name,
              value: row.cost_variance_pct,
            }))}
          />
          <TableFrame>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ background: 'var(--color-bg-sidebar)' }}>
                  <th className="kpi-label px-3 py-2">Receta</th>
                  <th className="kpi-label px-3 py-2">Órdenes</th>
                  <th className="kpi-label px-3 py-2">Raciones</th>
                  <th className="kpi-label px-3 py-2">Estimado</th>
                  <th className="kpi-label px-3 py-2">Real</th>
                  <th className="kpi-label px-3 py-2">Var.</th>
                  <th className="kpi-label px-3 py-2">€/ración</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.recipe_id} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <td className="px-3 py-2 font-medium">{row.recipe_name}</td>
                    <td className="px-3 py-2 font-data">{row.production_orders_count}</td>
                    <td className="px-3 py-2 font-data">{numberFormatter.format(row.total_servings_produced)}</td>
                    <td className="px-3 py-2 font-data">{currencyFormatter.format(row.total_estimated_cost)}</td>
                    <td className="px-3 py-2 font-data">{currencyFormatter.format(row.total_actual_cost)}</td>
                    <td className="px-3 py-2 font-data">
                      {row.cost_variance_pct === null ? '-' : `${percentFormatter.format(row.cost_variance_pct)}%`}
                    </td>
                    <td className="px-3 py-2 font-data">
                      {row.avg_actual_cost_per_serving === null
                        ? '-'
                        : currencyFormatter.format(row.avg_actual_cost_per_serving)}
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
