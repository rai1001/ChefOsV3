'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { useWarehouses } from '@/features/warehouse'
import { useConsumeInventory } from '../application/use-consume-inventory'
import { useInventorySnapshot } from '../application/use-inventory-snapshot'
import { useRegisterAdjustment } from '../application/use-register-adjustment'
import { useRegisterWaste } from '../application/use-register-waste'

type InventoryAction = 'consume' | 'waste' | 'adjustment'

const actionCopy: Record<
  InventoryAction,
  {
    title: string
    quantityLabel: string
    noteLabel: string
    noteRequired: boolean
    submit: string
    help: string
  }
> = {
  consume: {
    title: 'Consumo manual',
    quantityLabel: 'Cantidad consumida',
    noteLabel: 'Nota',
    noteRequired: false,
    submit: 'Registrar consumo',
    help: 'El descuento se aplica por FIFO sobre los lotes activos.',
  },
  waste: {
    title: 'Registrar merma',
    quantityLabel: 'Cantidad mermada',
    noteLabel: 'Razón',
    noteRequired: true,
    submit: 'Registrar merma',
    help: 'La merma descuenta stock por FIFO y queda como movimiento append-only.',
  },
  adjustment: {
    title: 'Ajuste de stock',
    quantityLabel: 'Delta de cantidad',
    noteLabel: 'Razón',
    noteRequired: true,
    submit: 'Registrar ajuste',
    help: 'Usa positivo para alta manual y negativo para salida correctiva.',
  },
}

const numberFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 4,
})

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
})

export function InventoryActionForm({
  hotelId,
  productId,
  action,
}: {
  hotelId: string
  productId: string
  action: InventoryAction
}) {
  const router = useRouter()
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const snapshot = useInventorySnapshot({
    hotelId,
    warehouseId: warehouseId || undefined,
    onlyWithStock: false,
  })
  const warehouses = useWarehouses(hotelId, { activeOnly: true })
  const consume = useConsumeInventory()
  const waste = useRegisterWaste()
  const adjustment = useRegisterAdjustment()
  const copy = actionCopy[action]

  const product = useMemo(
    () => snapshot.data?.find((row) => row.product_id === productId),
    [productId, snapshot.data]
  )

  const pending = consume.isPending || waste.isPending || adjustment.isPending

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setSuccess(null)

    const parsedQuantity = Number(quantity.replace(',', '.'))
    if (!Number.isFinite(parsedQuantity) || parsedQuantity === 0) {
      setFormError('Introduce una cantidad válida.')
      return
    }
    if (action !== 'adjustment' && parsedQuantity <= 0) {
      setFormError('La cantidad debe ser mayor que cero.')
      return
    }
    if (copy.noteRequired && note.trim().length === 0) {
      setFormError('La razón es obligatoria.')
      return
    }

    try {
      if (action === 'consume') {
        const result = await consume.mutateAsync({
          hotel_id: hotelId,
          product_id: productId,
          warehouse_id: warehouseId || null,
          quantity: parsedQuantity,
          origin: {
            source: 'manual_inventory',
            note: note.trim() || null,
          },
        })
        setSuccess(
          `Consumo registrado: ${numberFormatter.format(result.quantity)} uds · ${currencyFormatter.format(result.total_cost)}.`
        )
      } else if (action === 'waste') {
        const result = await waste.mutateAsync({
          hotel_id: hotelId,
          product_id: productId,
          warehouse_id: warehouseId || null,
          quantity: parsedQuantity,
          reason: note.trim(),
        })
        setSuccess(
          `Merma registrada: ${numberFormatter.format(result.quantity)} uds · ${currencyFormatter.format(result.total_cost)}.`
        )
      } else {
        const result = await adjustment.mutateAsync({
          hotel_id: hotelId,
          product_id: productId,
          warehouse_id: warehouseId || null,
          quantity_delta: parsedQuantity,
          reason: note.trim(),
        })
        setSuccess(
          `Ajuste registrado: ${numberFormatter.format(result.quantity_delta)} uds · ${currencyFormatter.format(result.total_cost)}.`
        )
      }

      router.refresh()
      setTimeout(() => router.push(`/inventory/products/${productId}`), 800)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo registrar la acción.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded border p-4"
      style={{
        borderColor: 'var(--color-border)',
        background: 'var(--color-bg-card)',
      }}
    >
      <div>
        <p className="kpi-label">{copy.title}</p>
        <h2>{product?.name ?? productId}</h2>
        <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">{copy.help}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div
          className="rounded border p-3"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-primary)',
          }}
        >
          <p className="kpi-label">Stock actual</p>
          <p className="mt-1 font-data text-lg">
            {numberFormatter.format(product?.qty_on_hand ?? 0)}
          </p>
        </div>
        <div
          className="rounded border p-3"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-primary)',
          }}
        >
          <p className="kpi-label">Valor stock</p>
          <p className="mt-1 font-data text-lg">
            {currencyFormatter.format(product?.valor_stock ?? 0)}
          </p>
        </div>
        <div
          className="rounded border p-3"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-primary)',
          }}
        >
          <p className="kpi-label">Lotes activos</p>
          <p className="mt-1 font-data text-lg">{product?.lots_count ?? 0}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="inventory-action-warehouse" className="kpi-label mb-1 block">
            Almacén
          </label>
          <select
            id="inventory-action-warehouse"
            value={warehouseId}
            onChange={(event) => setWarehouseId(event.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-input)',
            }}
          >
            <option value="">Global hotel</option>
            {(warehouses.data ?? []).map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="inventory-action-quantity" className="kpi-label mb-1 block">
            {copy.quantityLabel}
          </label>
          <input
            id="inventory-action-quantity"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            inputMode="decimal"
            placeholder={action === 'adjustment' ? 'Ej. 2 o -1,5' : 'Ej. 1,5'}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-input)',
            }}
          />
        </div>
        <div>
          <label htmlFor="inventory-action-note" className="kpi-label mb-1 block">
            {copy.noteLabel}
          </label>
          <input
            id="inventory-action-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            required={copy.noteRequired}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-input)',
            }}
          />
        </div>
      </div>

      {formError ? <p className="text-sm text-danger">{formError}</p> : null}
      {success ? <p className="text-sm text-success">{success}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Registrando...' : copy.submit}
        </Button>
        <Button asChild variant="secondary">
          <Link href={`/inventory/products/${productId}`}>Volver</Link>
        </Button>
      </div>
    </form>
  )
}
