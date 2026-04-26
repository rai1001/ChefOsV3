'use client'

import Link from 'next/link'
import { ArrowLeft, ClipboardCheck, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProducts, useUnits } from '@/features/catalog'
import { usePurchaseOrder } from '../application/use-purchase-order'
import { usePurchaseOrderLines } from '../application/use-purchase-order-lines'
import { useTransitionPO } from '../application/use-transition-po'
import { getPendingQuantity } from '../domain/invariants'
import { POStatusBadge } from './po-status-badge'

interface PurchaseOrderDetailProps {
  hotelId: string
  orderId: string
  createdReceiptId?: string
}

export function PurchaseOrderDetail({
  hotelId,
  orderId,
  createdReceiptId,
}: PurchaseOrderDetailProps) {
  const order = usePurchaseOrder(hotelId, orderId)
  const lines = usePurchaseOrderLines(hotelId, orderId)
  const products = useProducts({ hotelId, activeOnly: false }, { pageSize: 200 })
  const units = useUnits(hotelId)
  const transition = useTransitionPO()

  const productById = new Map((products.data?.rows ?? []).map((product) => [product.id, product]))
  const unitById = new Map((units.data ?? []).map((unit) => [unit.id, unit]))
  const orderRows = lines.data ?? []
  const canReceive =
    order.data?.status === 'sent' || order.data?.status === 'received_partial'

  const markSent = async () => {
    await transition.mutateAsync({
      hotel_id: hotelId,
      order_id: orderId,
      status: 'sent',
    })
  }

  if (order.isLoading || lines.isLoading) {
    return <p className="kpi-label">Cargando pedido...</p>
  }
  if (order.error) return <p className="text-danger">Error: {order.error.message}</p>
  if (lines.error) return <p className="text-danger">Error: {lines.error.message}</p>
  if (!order.data) return null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <POStatusBadge status={order.data.status} />
          <span className="badge-status neutral">PO {order.data.id.slice(0, 8)}</span>
          {createdReceiptId ? (
            <Link
              href={`/procurement/goods-receipts/${createdReceiptId}`}
              className="badge-status success hover:underline"
            >
              GR {createdReceiptId.slice(0, 8)}
            </Link>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href="/procurement/purchase-orders">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver
            </Link>
          </Button>
          {order.data.status === 'draft' ? (
            <Button
              variant="secondary"
              size="sm"
              disabled={transition.isPending}
              onClick={markSent}
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Enviar
            </Button>
          ) : null}
          {canReceive ? (
            <Button asChild size="sm">
              <Link href={`/procurement/purchase-orders/${orderId}/receive`}>
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                Recibir mercancía
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div
        className="rounded border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <dl className="grid gap-4 text-sm md:grid-cols-4">
          <div>
            <dt className="kpi-label">Fecha pedido</dt>
            <dd className="font-data">{order.data.order_date}</dd>
          </div>
          <div>
            <dt className="kpi-label">Entrega prevista</dt>
            <dd className="font-data">{order.data.expected_delivery_date ?? '-'}</dd>
          </div>
          <div>
            <dt className="kpi-label">Proveedor</dt>
            <dd className="font-code text-xs">{order.data.supplier_id}</dd>
          </div>
          <div>
            <dt className="kpi-label">Lineas</dt>
            <dd className="font-data">{orderRows.length}</dd>
          </div>
        </dl>
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
              <th className="kpi-label px-3 py-2">Departamento</th>
              <th className="kpi-label px-3 py-2">Pedido</th>
              <th className="kpi-label px-3 py-2">Recibido</th>
              <th className="kpi-label px-3 py-2">Pendiente</th>
              <th className="kpi-label px-3 py-2">Ultimo precio</th>
            </tr>
          </thead>
          <tbody>
            {orderRows.map((line) => {
              const product = productById.get(line.product_id)
              const unit = line.unit_id ? unitById.get(line.unit_id) : null
              return (
                <tr
                  key={line.id}
                  className="border-t"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <td className="px-3 py-2">
                    <div>{product?.name ?? line.product_id}</div>
                    {product?.sku ? (
                      <div className="font-code text-xs text-[color:var(--color-text-muted)]">
                        {product.sku}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">{line.department.replaceAll('_', ' ')}</td>
                  <td className="px-3 py-2 font-data">
                    {line.quantity_ordered} {unit?.abbreviation ?? ''}
                  </td>
                  <td className="px-3 py-2 font-data">{line.quantity_received}</td>
                  <td className="px-3 py-2 font-data">{getPendingQuantity(line)}</td>
                  <td className="px-3 py-2 font-data">
                    {line.last_unit_price?.toFixed(4) ?? '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {transition.error ? (
        <p className="text-sm text-danger">{transition.error.message}</p>
      ) : null}
    </div>
  )
}
