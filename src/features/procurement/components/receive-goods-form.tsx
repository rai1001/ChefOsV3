'use client'

import { useId, useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProducts, useUnits } from '@/features/catalog'
import { useWarehouses } from '@/features/warehouse'
import { usePurchaseOrder } from '../application/use-purchase-order'
import { usePurchaseOrderLines } from '../application/use-purchase-order-lines'
import { useReceiveGoods } from '../application/use-receive-goods'
import { getPendingQuantity } from '../domain/invariants'
import { receiveGoodsSchema, type ReceiveGoodsInput } from '../domain/schemas'
import { GR_QUALITY_STATUSES, type GoodsReceiptQualityStatus } from '../domain/types'

export function ReceiveGoodsForm({ hotelId, orderId }: { hotelId: string; orderId: string }) {
  const formId = useId()
  const router = useRouter()
  const order = usePurchaseOrder(hotelId, orderId)
  const lines = usePurchaseOrderLines(hotelId, orderId)
  const products = useProducts({ hotelId, activeOnly: false }, { pageSize: 200 })
  const units = useUnits(hotelId)
  const warehouses = useWarehouses(hotelId, { activeOnly: true })
  const receive = useReceiveGoods()
  const [qualityByLine, setQualityByLine] = useState<Record<string, GoodsReceiptQualityStatus>>({})
  const [notes, setNotes] = useState('')
  const [zodError, setZodError] = useState<string | null>(null)

  const productById = useMemo(
    () => new Map((products.data?.rows ?? []).map((product) => [product.id, product])),
    [products.data?.rows]
  )
  const unitById = useMemo(
    () => new Map((units.data ?? []).map((unit) => [unit.id, unit])),
    [units.data]
  )
  const receivableLines = useMemo(
    () =>
      (lines.data ?? [])
        .map((line) => ({ line, pendingQuantity: getPendingQuantity(line) }))
        .filter((entry) => entry.pendingQuantity > 0),
    [lines.data]
  )
  const defaultWarehouseId = useMemo(
    () =>
      (warehouses.data ?? []).find((warehouse) => warehouse.is_default)?.id ??
      warehouses.data?.[0]?.id ??
      '',
    [warehouses.data]
  )

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setZodError(null)

    const formData = new FormData(event.currentTarget)
    const candidate: ReceiveGoodsInput = {
      hotel_id: hotelId,
      purchase_order_id: orderId,
      notes: notes.trim() || null,
      lines: receivableLines.map(({ line }) => ({
        purchase_order_line_id: line.id,
        quantity_received: Number(formData.get(`${line.id}:quantity`) ?? 0),
        unit_price: Number(formData.get(`${line.id}:price`) ?? 0),
        quality_status: qualityByLine[line.id] ?? 'accepted',
        rejection_reason: String(formData.get(`${line.id}:rejection`) ?? '').trim() || null,
        lot_number: String(formData.get(`${line.id}:lot`) ?? '').trim() || null,
        expiry_date: String(formData.get(`${line.id}:expiry`) ?? '') || null,
        notes: String(formData.get(`${line.id}:notes`) ?? '').trim() || null,
        warehouse_id: String(formData.get(`${line.id}:warehouse`) ?? '').trim() || null,
      })),
    }

    const parsed = receiveGoodsSchema.safeParse(candidate)
    if (!parsed.success) {
      setZodError(parsed.error.issues.map((issue) => issue.message).join(' · '))
      return
    }

    const result = await receive.mutateAsync(parsed.data)
    router.push(
      `/procurement/purchase-orders/${orderId}?goods_receipt_id=${result.goods_receipt_id}`
    )
  }

  if (order.isLoading || lines.isLoading) {
    return <p className="kpi-label">Cargando pedido...</p>
  }
  if (order.error) return <p className="text-danger">Error: {order.error.message}</p>
  if (lines.error) return <p className="text-danger">Error: {lines.error.message}</p>
  if (!order.data) return null

  const canReceive = order.data.status === 'sent' || order.data.status === 'received_partial'
  const isPending = receive.isPending

  return (
    <form onSubmit={submit} className="space-y-4">
      <div
        className="rounded border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="kpi-label">Pedido</p>
            <h2>PO {order.data.id.slice(0, 8)}</h2>
          </div>
          <span className="badge-status neutral">{order.data.status}</span>
        </div>
      </div>

      {!canReceive ? (
        <p className="text-danger">Este pedido no admite recepcion manual.</p>
      ) : null}

      {receivableLines.length === 0 ? (
        <p className="text-[color:var(--color-text-muted)]">No hay cantidades pendientes.</p>
      ) : (
        <div className="space-y-3">
          {receivableLines.map(({ line, pendingQuantity }, index) => {
            const product = productById.get(line.product_id)
            const unit = line.unit_id ? unitById.get(line.unit_id) : null
            const qualityStatus = qualityByLine[line.id] ?? 'accepted'
            const lineId = `${formId}-${line.id}`

            return (
              <section
                key={line.id}
                className="rounded border p-4"
                style={{
                  borderColor: 'var(--color-border)',
                  background: 'var(--color-bg-card)',
                }}
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="kpi-label">Linea {index + 1}</p>
                    <h3>{product?.name ?? line.product_id}</h3>
                    <p className="text-sm text-[color:var(--color-text-muted)]">
                      Pendiente: {pendingQuantity} {unit?.abbreviation ?? ''}
                    </p>
                  </div>
                  <span className="badge-status neutral font-data">{line.id.slice(0, 8)}</span>
                </div>

                <div className="grid gap-3 md:grid-cols-7">
                  <div>
                    <label htmlFor={`${lineId}-quantity`} className="kpi-label mb-1 block">
                      Cantidad
                    </label>
                    <input
                      id={`${lineId}-quantity`}
                      name={`${line.id}:quantity`}
                      type="number"
                      min="0"
                      step="0.001"
                      defaultValue={pendingQuantity}
                      className="w-full rounded border px-3 py-2 text-sm"
                      style={{
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-bg-card)',
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor={`${lineId}-price`} className="kpi-label mb-1 block">
                      Precio
                    </label>
                    <input
                      id={`${lineId}-price`}
                      name={`${line.id}:price`}
                      type="number"
                      min="0"
                      step="0.0001"
                      defaultValue={line.last_unit_price ?? 0}
                      className="w-full rounded border px-3 py-2 text-sm"
                      style={{
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-bg-card)',
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor={`${lineId}-quality`} className="kpi-label mb-1 block">
                      Calidad
                    </label>
                    <select
                      id={`${lineId}-quality`}
                      value={qualityStatus}
                      onChange={(event) =>
                        setQualityByLine((current) => ({
                          ...current,
                          [line.id]: event.target.value as GoodsReceiptQualityStatus,
                        }))
                      }
                      className="w-full rounded border px-3 py-2 text-sm"
                      style={{
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-bg-card)',
                      }}
                    >
                      {GR_QUALITY_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor={`${lineId}-warehouse`} className="kpi-label mb-1 block">
                      Almacén
                    </label>
                    <select
                      id={`${lineId}-warehouse`}
                      name={`${line.id}:warehouse`}
                      defaultValue={defaultWarehouseId}
                      className="w-full rounded border px-3 py-2 text-sm"
                      style={{
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-bg-card)',
                      }}
                    >
                      <option value="">Default hotel</option>
                      {(warehouses.data ?? []).map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor={`${lineId}-lot`} className="kpi-label mb-1 block">
                      Lote
                    </label>
                    <input
                      id={`${lineId}-lot`}
                      name={`${line.id}:lot`}
                      className="w-full rounded border px-3 py-2 text-sm"
                      style={{
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-bg-card)',
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor={`${lineId}-expiry`} className="kpi-label mb-1 block">
                      Caducidad
                    </label>
                    <input
                      id={`${lineId}-expiry`}
                      name={`${line.id}:expiry`}
                      type="date"
                      className="w-full rounded border px-3 py-2 text-sm"
                      style={{
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-bg-card)',
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor={`${lineId}-notes`} className="kpi-label mb-1 block">
                      Notas
                    </label>
                    <input
                      id={`${lineId}-notes`}
                      name={`${line.id}:notes`}
                      className="w-full rounded border px-3 py-2 text-sm"
                      style={{
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-bg-card)',
                      }}
                    />
                  </div>
                </div>

                {qualityStatus === 'rejected' ? (
                  <div className="mt-3">
                    <label htmlFor={`${lineId}-rejection`} className="kpi-label mb-1 block">
                      Motivo rechazo
                    </label>
                    <input
                      id={`${lineId}-rejection`}
                      name={`${line.id}:rejection`}
                      className="w-full rounded border px-3 py-2 text-sm"
                      style={{
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-bg-card)',
                      }}
                    />
                  </div>
                ) : null}
              </section>
            )
          })}
        </div>
      )}

      <div
        className="rounded border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <label htmlFor={`${formId}-notes`} className="kpi-label mb-1 block">
          Notas recepción
        </label>
        <textarea
          id={`${formId}-notes`}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          className="w-full rounded border px-3 py-2 text-sm"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
        />
      </div>

      {(zodError || receive.error) && (
        <p className="text-sm text-danger">{zodError ?? receive.error?.message}</p>
      )}

      <Button type="submit" disabled={!canReceive || receivableLines.length === 0 || isPending}>
        <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
        {isPending ? 'Registrando' : 'Registrar recepción'}
      </Button>
    </form>
  )
}
