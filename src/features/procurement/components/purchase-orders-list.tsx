'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ClipboardCheck, Eye, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePurchaseOrders } from '../application/use-purchase-orders'
import { useTransitionPO } from '../application/use-transition-po'
import { PO_STATUSES, type PurchaseOrderStatus } from '../domain/types'
import { PO_STATUS_LABELS } from '../domain/invariants'
import { POStatusBadge } from './po-status-badge'

export function PurchaseOrdersList({ hotelId }: { hotelId: string }) {
  const [status, setStatus] = useState<PurchaseOrderStatus | 'all'>('all')
  const transition = useTransitionPO()

  const { data, isLoading, error } = usePurchaseOrders({
    hotelId,
    status: status === 'all' ? undefined : status,
  })

  if (isLoading) return <p className="kpi-label">Cargando pedidos...</p>
  if (error) return <p className="text-danger">Error: {error.message}</p>

  const rows = data?.rows ?? []

  const markSent = async (orderId: string) => {
    await transition.mutateAsync({
      hotel_id: hotelId,
      order_id: orderId,
      status: 'sent',
    })
  }

  return (
    <div className="space-y-3">
      <select
        value={status}
        aria-label="Filtrar pedidos por estado"
        onChange={(event) => setStatus(event.target.value as PurchaseOrderStatus | 'all')}
        className="rounded border px-3 py-2 text-sm"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <option value="all">Todos los estados</option>
        {PO_STATUSES.map((poStatus) => (
          <option key={poStatus} value={poStatus}>
            {PO_STATUS_LABELS[poStatus]}
          </option>
        ))}
      </select>

      {rows.length === 0 ? (
        <p className="text-[color:var(--color-text-muted)]">No hay pedidos.</p>
      ) : (
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
                <th className="kpi-label px-3 py-2">Fecha</th>
                <th className="kpi-label px-3 py-2">Proveedor</th>
                <th className="kpi-label px-3 py-2">Estado</th>
                <th className="kpi-label px-3 py-2">PDF</th>
                <th className="kpi-label px-3 py-2 text-right">Accion</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((order) => (
                <tr
                  key={order.id}
                  className="border-t transition-colors hover:bg-[color:var(--color-bg-hover)]"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <td className="px-3 py-2 font-data">
                    <Link
                      href={`/procurement/purchase-orders/${order.id}`}
                      className="hover:underline"
                    >
                      {order.order_date}
                    </Link>
                  </td>
                  <td className="px-3 py-2 font-code text-xs">{order.supplier_id}</td>
                  <td className="px-3 py-2">
                    <POStatusBadge status={order.status} />
                  </td>
                  <td className="px-3 py-2 text-[color:var(--color-text-muted)]">
                    {order.pdf_path ?? '-'}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {order.status === 'draft' ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={transition.isPending}
                        onClick={() => markSent(order.id)}
                      >
                        <Send className="h-4 w-4" aria-hidden="true" />
                        Enviar
                      </Button>
                    ) : order.status === 'sent' || order.status === 'received_partial' ? (
                      <Button asChild size="sm">
                        <Link href={`/procurement/purchase-orders/${order.id}/receive`}>
                          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                          Recibir
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="secondary">
                        <Link href={`/procurement/purchase-orders/${order.id}`}>
                          <Eye className="h-4 w-4" aria-hidden="true" />
                          Ver
                        </Link>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {transition.error && <p className="text-sm text-danger">{transition.error.message}</p>}
    </div>
  )
}
