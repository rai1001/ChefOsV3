'use client'

import { useMemo } from 'react'
import { useProducts, useSuppliers } from '@/features/catalog'
import type { ReportDateRange } from '../domain/filters'
import { priceChangesSummary } from '../domain/price-changes'
import { useCsvExport } from '../application/use-csv-export'
import { usePriceChangesReport } from '../application/use-price-changes-report'
import {
  currencyFormatter,
  LineChart,
  MetricCard,
  percentFormatter,
  QueryState,
  ReportDateFilters,
  ReportToolbar,
  TableFrame,
  UrlSelectFilter,
} from './report-ui'

export function PriceChangesReport({
  hotelId,
  range,
  supplierId,
  productId,
}: {
  hotelId: string
  range: ReportDateRange
  supplierId?: string
  productId?: string
}) {
  const suppliers = useSuppliers({ hotelId, activeOnly: true }, { pageSize: 200 })
  const products = useProducts({ hotelId, activeOnly: true }, { pageSize: 200 })
  const filter = useMemo(
    () => ({ hotelId, ...range, supplierId, productId, limit: 200 }),
    [hotelId, productId, range, supplierId]
  )
  const report = usePriceChangesReport(filter)
  const rows = report.data ?? []
  const summary = priceChangesSummary(rows)
  const exportHref = useCsvExport({ name: 'price-changes', ...range, supplierId, productId })

  return (
    <div className="space-y-6">
      <div className="grid gap-3 lg:grid-cols-[1fr_240px_240px]">
        <ReportDateFilters range={range} />
        <UrlSelectFilter
          label="Proveedor"
          param="supplierId"
          value={supplierId ?? ''}
          options={(suppliers.data?.rows ?? []).map((supplier) => ({
            value: supplier.id,
            label: supplier.name,
          }))}
        />
        <UrlSelectFilter
          label="Producto"
          param="productId"
          value={productId ?? ''}
          options={(products.data?.rows ?? []).map((product) => ({
            value: product.id,
            label: product.name,
          }))}
        />
      </div>
      <ReportToolbar
        exportHref={exportHref}
        onRefresh={() => void report.refetch()}
        isRefreshing={report.isFetching}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <MetricCard label="Cambios" value={summary.count} />
        <MetricCard
          label="Delta medio"
          value={summary.avgDeltaPct === null ? '-' : `${percentFormatter.format(summary.avgDeltaPct)}%`}
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
            label="Delta %"
            values={[...rows].reverse().map((row) => ({
              label: row.product_name,
              value: row.delta_pct,
            }))}
          />
          <TableFrame>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ background: 'var(--color-bg-sidebar)' }}>
                  <th className="kpi-label px-3 py-2">Fecha</th>
                  <th className="kpi-label px-3 py-2">Producto</th>
                  <th className="kpi-label px-3 py-2">Proveedor</th>
                  <th className="kpi-label px-3 py-2">Anterior</th>
                  <th className="kpi-label px-3 py-2">Nuevo</th>
                  <th className="kpi-label px-3 py-2">Delta</th>
                  <th className="kpi-label px-3 py-2">Fuente</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.price_change_id} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <td className="px-3 py-2 font-data">{new Date(row.detected_at).toLocaleString('es-ES')}</td>
                    <td className="px-3 py-2 font-medium">{row.product_name}</td>
                    <td className="px-3 py-2">{row.supplier_name ?? '-'}</td>
                    <td className="px-3 py-2 font-data">
                      {row.old_price === null ? '-' : currencyFormatter.format(row.old_price)}
                    </td>
                    <td className="px-3 py-2 font-data">{currencyFormatter.format(row.new_price)}</td>
                    <td className="px-3 py-2 font-data">
                      {row.delta_pct === null ? '-' : `${percentFormatter.format(row.delta_pct)}%`}
                    </td>
                    <td className="px-3 py-2">{row.source}</td>
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
