'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGoodsReceipt } from '../application/use-goods-receipt'
import { GRQualityBadge } from './gr-quality-badge'

export function GoodsReceiptDetail({ receiptId }: { receiptId: string }) {
  const { data: receipt, isLoading, error } = useGoodsReceipt(receiptId)

  if (isLoading) return <p className="kpi-label">Cargando recepcion...</p>
  if (error) return <p className="text-danger">Error: {error.message}</p>
  if (!receipt) return null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge-status neutral">GR {receipt.id.slice(0, 8)}</span>
          <span className="badge-status neutral">
            {new Date(receipt.received_at).toLocaleString('es-ES')}
          </span>
          <span className="badge-status neutral">
            PO {receipt.purchase_order_id.slice(0, 8)}
          </span>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href="/procurement/goods-receipts">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver
          </Link>
        </Button>
      </div>

      <div
        className="rounded border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <dl className="grid gap-4 text-sm md:grid-cols-3">
          <div>
            <dt className="kpi-label">Proveedor</dt>
            <dd>{receipt.supplier_name ?? receipt.supplier_id}</dd>
          </div>
          <div>
            <dt className="kpi-label">Pedido</dt>
            <dd className="font-code text-xs">
              <Link
                href={`/procurement/purchase-orders/${receipt.purchase_order_id}`}
                className="hover:underline"
              >
                {receipt.purchase_order_id}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="kpi-label">Lineas</dt>
            <dd className="font-data">{receipt.lines.length}</dd>
          </div>
        </dl>
        {receipt.notes ? (
          <p className="mt-4 text-sm text-[color:var(--color-text-secondary)]">
            {receipt.notes}
          </p>
        ) : null}
      </div>

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
              <th className="kpi-label px-3 py-2">Producto</th>
              <th className="kpi-label px-3 py-2">Cantidad</th>
              <th className="kpi-label px-3 py-2">Precio</th>
              <th className="kpi-label px-3 py-2">Calidad</th>
              <th className="kpi-label px-3 py-2">Lote</th>
              <th className="kpi-label px-3 py-2">Caducidad</th>
              <th className="kpi-label px-3 py-2">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {receipt.lines.map((line) => (
              <tr
                key={line.id}
                className="border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <td className="px-3 py-2">
                  <div>{line.product_name ?? line.product_id}</div>
                  {line.product_sku ? (
                    <div className="font-code text-xs text-[color:var(--color-text-muted)]">
                      {line.product_sku}
                    </div>
                  ) : null}
                </td>
                <td className="px-3 py-2 font-data">
                  {line.quantity_received} {line.unit_name ?? ''}
                </td>
                <td className="px-3 py-2 font-data">{line.unit_price.toFixed(4)}</td>
                <td className="px-3 py-2">
                  <GRQualityBadge status={line.quality_status} />
                </td>
                <td className="px-3 py-2">{line.lot_number ?? '-'}</td>
                <td className="px-3 py-2">{line.expiry_date ?? '-'}</td>
                <td className="px-3 py-2 text-[color:var(--color-text-secondary)]">
                  {line.rejection_reason ?? line.notes ?? '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
