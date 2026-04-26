'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useSuppliers } from '@/features/catalog'
import { useGoodsReceipts } from '../application/use-goods-receipts'
import { GRQualityBadge } from './gr-quality-badge'

export function GoodsReceiptsList({ hotelId }: { hotelId: string }) {
  const [supplierId, setSupplierId] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const suppliers = useSuppliers({ hotelId, activeOnly: true }, { pageSize: 200 })
  const filter = useMemo(
    () => ({
      hotelId,
      supplierId: supplierId || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    }),
    [fromDate, hotelId, supplierId, toDate]
  )
  const { data, isLoading, error } = useGoodsReceipts(filter, { pageSize: 100 })

  const rows = data?.rows ?? []
  const supplierRows = suppliers.data?.rows ?? []

  return (
    <div className="space-y-3">
      <div
        className="grid gap-3 rounded border p-4 md:grid-cols-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <div className="md:col-span-2">
          <label htmlFor="gr-supplier" className="kpi-label mb-1 block">
            Proveedor
          </label>
          <select
            id="gr-supplier"
            value={supplierId}
            onChange={(event) => setSupplierId(event.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          >
            <option value="">Todos</option>
            {supplierRows.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="gr-from" className="kpi-label mb-1 block">
            Desde
          </label>
          <input
            id="gr-from"
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
        <div>
          <label htmlFor="gr-to" className="kpi-label mb-1 block">
            Hasta
          </label>
          <input
            id="gr-to"
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
      </div>

      {isLoading ? <p className="kpi-label">Cargando recepciones...</p> : null}
      {error ? <p className="text-danger">Error: {error.message}</p> : null}

      {!isLoading && rows.length === 0 ? (
        <p className="text-[color:var(--color-text-muted)]">No hay recepciones.</p>
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
                <th className="kpi-label px-3 py-2">GR</th>
                <th className="kpi-label px-3 py-2">Fecha</th>
                <th className="kpi-label px-3 py-2">Proveedor</th>
                <th className="kpi-label px-3 py-2">PO</th>
                <th className="kpi-label px-3 py-2">Lineas</th>
                <th className="kpi-label px-3 py-2">Calidad</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((receipt) => (
                <tr
                  key={receipt.id}
                  className="border-t transition-colors hover:bg-[color:var(--color-bg-hover)]"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <td className="px-3 py-2 font-code text-xs">
                    <Link href={`/procurement/goods-receipts/${receipt.id}`} className="hover:underline">
                      {receipt.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-3 py-2 font-data">
                    {new Date(receipt.received_at).toLocaleString('es-ES')}
                  </td>
                  <td className="px-3 py-2">{receipt.supplier_name ?? receipt.supplier_id}</td>
                  <td className="px-3 py-2 font-code text-xs">
                    <Link
                      href={`/procurement/purchase-orders/${receipt.purchase_order_id}`}
                      className="hover:underline"
                    >
                      {receipt.purchase_order_id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-3 py-2 font-data">{receipt.line_count}</td>
                  <td className="px-3 py-2">
                    <GRQualityBadge status={receipt.quality_summary} />
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
