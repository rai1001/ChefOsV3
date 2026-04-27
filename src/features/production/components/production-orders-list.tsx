'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Eye, Factory, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  PRODUCTION_STATUSES,
  PRODUCTION_STATUS_LABELS,
  type ProductionStatus,
} from '../domain/order'
import { useProductionList } from '../application/use-production-list'
import { ProductionStatusBadge } from './production-status-badge'

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
})

const numberFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 4,
})

export function ProductionOrdersList({ hotelId }: { hotelId: string }) {
  const [status, setStatus] = useState<ProductionStatus | 'all'>('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const filter = useMemo(
    () => ({
      hotelId,
      status: status === 'all' ? undefined : status,
      from: from || undefined,
      to: to || undefined,
      limit: 100,
    }),
    [from, hotelId, status, to]
  )

  const orders = useProductionList(filter)
  const rows = orders.data ?? []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid flex-1 gap-3 md:grid-cols-3">
          <label className="block">
            <span className="kpi-label mb-1 block">Estado</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as ProductionStatus | 'all')}
              className="w-full rounded border px-3 py-2 text-sm"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-bg-input)',
              }}
            >
              <option value="all">Todos</option>
              {PRODUCTION_STATUSES.map((productionStatus) => (
                <option key={productionStatus} value={productionStatus}>
                  {PRODUCTION_STATUS_LABELS[productionStatus]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="kpi-label mb-1 block">Desde</span>
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-bg-input)',
              }}
            />
          </label>

          <label className="block">
            <span className="kpi-label mb-1 block">Hasta</span>
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-bg-input)',
              }}
            />
          </label>
        </div>

        <Button asChild>
          <Link href="/production/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva orden
          </Link>
        </Button>
      </div>

      {orders.isLoading ? <p className="kpi-label">Cargando producción...</p> : null}
      {orders.error ? <p className="text-danger">Error: {orders.error.message}</p> : null}

      {!orders.isLoading && rows.length === 0 ? (
        <div
          className="rounded border p-6"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
        >
          <Factory className="mb-3 h-5 w-5" aria-hidden="true" />
          <h2>Sin órdenes</h2>
        </div>
      ) : null}

      {rows.length > 0 ? (
        <div
          className="overflow-hidden rounded border"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left"
                style={{
                  background: 'var(--color-bg-sidebar)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <th className="kpi-label px-3 py-2">Receta</th>
                <th className="kpi-label px-3 py-2">Raciones</th>
                <th className="kpi-label px-3 py-2">Estado</th>
                <th className="kpi-label px-3 py-2">Programada</th>
                <th className="kpi-label px-3 py-2">Coste estimado</th>
                <th className="kpi-label px-3 py-2 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((order) => (
                <tr
                  key={order.id}
                  className="border-t transition-colors hover:bg-[color:var(--color-bg-hover)]"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <td className="px-3 py-2 font-medium">{order.recipe_name}</td>
                  <td className="px-3 py-2 font-data">
                    {numberFormatter.format(order.servings)}
                  </td>
                  <td className="px-3 py-2">
                    <ProductionStatusBadge status={order.status} />
                  </td>
                  <td className="px-3 py-2 font-data">
                    {order.scheduled_at
                      ? new Date(order.scheduled_at).toLocaleString('es-ES')
                      : '-'}
                  </td>
                  <td className="px-3 py-2 font-data">
                    {currencyFormatter.format(order.estimated_total_cost)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/production/${order.id}`}>
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        Ver
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
