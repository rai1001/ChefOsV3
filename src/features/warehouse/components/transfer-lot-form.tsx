'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { ArrowRightLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useProducts } from '@/features/catalog'
import { useProductLots } from '@/features/inventory'
import { transferLotSchema } from '../domain/schemas'
import { useTransferLot } from '../application/use-transfer-lot'
import { useWarehouses } from '../application/use-warehouses'

const numberFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 4,
})

export function TransferLotForm({ hotelId }: { hotelId: string }) {
  const products = useProducts({ hotelId, activeOnly: true }, { pageSize: 200 })
  const warehouses = useWarehouses(hotelId, { activeOnly: true })
  const transfer = useTransferLot()
  const [productId, setProductId] = useState('')
  const [lotId, setLotId] = useState('')
  const [toWarehouseId, setToWarehouseId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [notes, setNotes] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const lots = useProductLots(hotelId, productId || undefined)
  const selectedLot = (lots.data ?? []).find((lot) => lot.id === lotId)
  const destinationWarehouses = useMemo(
    () =>
      (warehouses.data ?? []).filter(
        (warehouse) => warehouse.id !== selectedLot?.warehouse_id
      ),
    [selectedLot?.warehouse_id, warehouses.data]
  )

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setValidationError(null)

    const parsed = transferLotSchema.safeParse({
      hotel_id: hotelId,
      lot_id: lotId,
      to_warehouse_id: toWarehouseId,
      quantity,
      notes,
    })

    if (!parsed.success) {
      setValidationError(
        parsed.error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(' · ')
      )
      return
    }

    await transfer.mutateAsync(parsed.data)
    setQuantity('1')
    setNotes('')
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div
        className="rounded border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="kpi-label mb-1 block">Producto</span>
            <select
              aria-label="Producto"
              value={productId}
              onChange={(event) => {
                setProductId(event.target.value)
                setLotId('')
                setToWarehouseId('')
              }}
              className="w-full rounded border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-input)' }}
            >
              <option value="">Selecciona producto</option>
              {(products.data?.rows ?? []).map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="kpi-label mb-1 block">Lote</span>
            <select
              aria-label="Lote"
              value={lotId}
              onChange={(event) => {
                setLotId(event.target.value)
                setToWarehouseId('')
              }}
              disabled={!productId}
              className="w-full rounded border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-input)' }}
            >
              <option value="">Selecciona lote</option>
              {(lots.data ?? []).map((lot) => (
                <option key={lot.id} value={lot.id}>
                  {lot.id.slice(0, 8)} · {lot.warehouse_name ?? 'Sin almacén'} ·{' '}
                  {numberFormatter.format(lot.quantity_remaining)} {lot.unit_abbreviation ?? ''}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="kpi-label mb-1 block">Destino</span>
            <select
              aria-label="Destino"
              value={toWarehouseId}
              onChange={(event) => setToWarehouseId(event.target.value)}
              disabled={!lotId}
              className="w-full rounded border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-input)' }}
            >
              <option value="">Selecciona destino</option>
              {destinationWarehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="kpi-label mb-1 block">Cantidad</span>
            <Input
              aria-label="Cantidad"
              type="number"
              min="0"
              step="0.0001"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </label>
        </div>

        <label className="mt-3 block">
          <span className="kpi-label mb-1 block">Notas</span>
          <Textarea
            aria-label="Notas"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
          />
        </label>
      </div>

      {(validationError || transfer.error || products.error || lots.error || warehouses.error) && (
        <p className="text-sm text-danger">
          {validationError ??
            transfer.error?.message ??
            products.error?.message ??
            lots.error?.message ??
            warehouses.error?.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={!lotId || !toWarehouseId || transfer.isPending}
      >
        <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
        {transfer.isPending ? 'Transfiriendo' : 'Transferir lote'}
      </Button>
    </form>
  )
}
