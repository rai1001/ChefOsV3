'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useStockHealthReport } from '../application/use-stock-health-report'
import {
  BarsChart,
  currencyFormatter,
  MetricCard,
  numberFormatter,
  QueryState,
  ReportToolbar,
  TableFrame,
} from './report-ui'

export function StockHealthReport({ hotelId }: { hotelId: string }) {
  const report = useStockHealthReport(hotelId)
  const data = report.data
  const expiringBars = useMemo(
    () =>
      (data?.expiring_soon ?? []).map((lot) => ({
        name: lot.product_name,
        value: lot.stock_value,
      })),
    [data?.expiring_soon]
  )

  return (
    <div className="space-y-6">
      <ReportToolbar onRefresh={() => void report.refetch()} isRefreshing={report.isFetching} />

      <QueryState
        isLoading={report.isLoading}
        error={report.error}
        empty={!report.isLoading && !data}
      />

      {data ? (
        <>
          <div className="grid gap-3 md:grid-cols-5">
            <MetricCard label="Productos" value={data.summary.total_products_with_stock} />
            <MetricCard label="Stock" value={numberFormatter.format(data.summary.total_qty_on_hand)} />
            <MetricCard label="Valor" value={currencyFormatter.format(data.summary.total_stock_value)} />
            <MetricCard label="Lotes" value={data.summary.total_lots_active} />
            <MetricCard label="Preparaciones" value={data.summary.total_preparation_lots_active} />
          </div>

          <BarsChart label="Próximos lotes por valor" rows={expiringBars} />

          <section className="space-y-2">
            <h2>Caducidad próxima</h2>
            <TableFrame>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left" style={{ background: 'var(--color-bg-sidebar)' }}>
                    <th className="kpi-label px-3 py-2">Producto</th>
                    <th className="kpi-label px-3 py-2">Cantidad</th>
                    <th className="kpi-label px-3 py-2">Valor</th>
                    <th className="kpi-label px-3 py-2">Caduca</th>
                    <th className="kpi-label px-3 py-2">Origen</th>
                  </tr>
                </thead>
                <tbody>
                  {data.expiring_soon.map((lot) => (
                    <tr key={lot.lot_id} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                      <td className="px-3 py-2 font-medium">{lot.product_name}</td>
                      <td className="px-3 py-2 font-data">
                        {numberFormatter.format(lot.quantity_remaining)} {lot.unit_abbreviation}
                      </td>
                      <td className="px-3 py-2 font-data">{currencyFormatter.format(lot.stock_value)}</td>
                      <td className="px-3 py-2 font-data">{new Date(lot.expires_at).toLocaleDateString('es-ES')}</td>
                      <td className="px-3 py-2">
                        {lot.production_order_id ? (
                          <Link href={`/production/${lot.production_order_id}`} className="hover:underline">
                            Producción
                          </Link>
                        ) : (
                          'Compra'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableFrame>
          </section>

          <section className="space-y-2">
            <h2>Stock muerto</h2>
            <TableFrame>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left" style={{ background: 'var(--color-bg-sidebar)' }}>
                    <th className="kpi-label px-3 py-2">Producto</th>
                    <th className="kpi-label px-3 py-2">Stock</th>
                    <th className="kpi-label px-3 py-2">Valor</th>
                    <th className="kpi-label px-3 py-2">Lotes</th>
                    <th className="kpi-label px-3 py-2">Último consumo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dead_stock.map((row) => (
                    <tr key={row.product_id} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                      <td className="px-3 py-2 font-medium">{row.product_name}</td>
                      <td className="px-3 py-2 font-data">{numberFormatter.format(row.qty_on_hand)}</td>
                      <td className="px-3 py-2 font-data">{currencyFormatter.format(row.stock_value)}</td>
                      <td className="px-3 py-2 font-data">{row.lots_count}</td>
                      <td className="px-3 py-2 font-data">
                        {row.last_consumed_at
                          ? new Date(row.last_consumed_at).toLocaleDateString('es-ES')
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableFrame>
          </section>
        </>
      ) : null}
    </div>
  )
}
