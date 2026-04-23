'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { offerInputSchema, type OfferInput } from '../domain/schemas'
import { isOfferDateRangeValid } from '../domain/invariants'
import { useCreateOffer } from '../application/use-supplier-offers'
import type { Product, UnitOfMeasure } from '../domain/types'
import { Button } from '@/components/ui/button'

interface Props {
  hotelId: string
  supplierId: string
  products: Product[]
  units: UnitOfMeasure[]
  onDone?: () => void
}

type FormShape = {
  product_id: string
  unit_id?: string | null
  unit_price: number
  min_quantity?: number | null
  valid_from?: string | null
  valid_to?: string | null
  is_preferred: boolean
  sku_supplier?: string | null
  notes?: string | null
}

export function OfferForm({ hotelId, supplierId, products, units, onDone }: Props) {
  const create = useCreateOffer()
  const [zodError, setZodError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState } = useForm<FormShape>({
    defaultValues: {
      product_id: '',
      unit_id: null,
      unit_price: 0,
      is_preferred: false,
    },
  })

  const toStrOrNull = (v: unknown): string | null => {
    if (v === null || v === undefined) return null
    const s = String(v).trim()
    return s.length === 0 ? null : s
  }
  const toNumOrNull = (v: unknown): number | null => {
    if (v === null || v === undefined || v === '') return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }

  const onSubmit = handleSubmit(async (values) => {
    setZodError(null)
    if (!isOfferDateRangeValid(values.valid_from, values.valid_to)) {
      setZodError('La fecha de inicio no puede ser posterior a la fecha de fin')
      return
    }

    const candidate: OfferInput = {
      hotel_id: hotelId,
      supplier_id: supplierId,
      product_id: values.product_id,
      unit_id: toStrOrNull(values.unit_id),
      unit_price: Number(values.unit_price),
      min_quantity: toNumOrNull(values.min_quantity),
      valid_from: toStrOrNull(values.valid_from),
      valid_to: toStrOrNull(values.valid_to),
      is_preferred: values.is_preferred,
      sku_supplier: toStrOrNull(values.sku_supplier),
      notes: toStrOrNull(values.notes),
    }

    const parsed = offerInputSchema.safeParse(candidate)
    if (!parsed.success) {
      setZodError(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' · '))
      return
    }

    try {
      await create.mutateAsync(parsed.data)
      reset()
      onDone?.()
    } catch (e) {
      console.error(e)
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="kpi-label mb-1 block">Producto *</label>
          <select
            {...register('product_id', { required: true })}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          >
            <option value="">— Seleccionar —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="kpi-label mb-1 block">Unidad</label>
          <select
            {...register('unit_id')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          >
            <option value="">— Sin unidad —</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.abbreviation})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="kpi-label mb-1 block">Precio unitario (€) *</label>
          <input
            type="number"
            step="any"
            min={0}
            {...register('unit_price', { valueAsNumber: true, required: true })}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
        <div>
          <label className="kpi-label mb-1 block">SKU proveedor</label>
          <input
            {...register('sku_supplier')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
        <div>
          <label className="kpi-label mb-1 block">Cantidad mínima</label>
          <input
            type="number"
            step="any"
            min={0}
            {...register('min_quantity')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('is_preferred')} />
            Marcar como preferida
          </label>
        </div>
        <div>
          <label className="kpi-label mb-1 block">Válido desde</label>
          <input
            type="date"
            {...register('valid_from')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
        <div>
          <label className="kpi-label mb-1 block">Válido hasta</label>
          <input
            type="date"
            {...register('valid_to')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
      </div>

      {zodError && <p className="text-sm text-danger">{zodError}</p>}
      {create.error && <p className="text-sm text-danger">{String(create.error.message)}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={formState.isSubmitting || create.isPending}>
          Crear oferta
        </Button>
      </div>
    </form>
  )
}
