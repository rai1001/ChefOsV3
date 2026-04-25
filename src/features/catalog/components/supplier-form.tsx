'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { supplierInputSchema, type SupplierInput } from '../domain/schemas'
import { useCreateSupplier, useUpdateSupplier } from '../application/use-suppliers'
import type { Supplier } from '../domain/types'
import { Button } from '@/components/ui/button'

interface Props {
  hotelId: string
  initial?: Supplier
  onDone?: (supplier: Supplier) => void
}

const DAYS = [
  { key: 'mon', label: 'Lun' },
  { key: 'tue', label: 'Mar' },
  { key: 'wed', label: 'Mié' },
  { key: 'thu', label: 'Jue' },
  { key: 'fri', label: 'Vie' },
  { key: 'sat', label: 'Sáb' },
  { key: 'sun', label: 'Dom' },
]

type FormShape = {
  name: string
  contact_name?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  tax_id?: string | null
  payment_terms?: string | null
  min_order_amount?: number | null
  rating: number
  notes?: string | null
  is_active: boolean
}

export function SupplierForm({ hotelId, initial, onDone }: Props) {
  const router = useRouter()
  const create = useCreateSupplier()
  const update = useUpdateSupplier()
  const [zodError, setZodError] = useState<string | null>(null)

  const initialDays = Array.isArray(initial?.delivery_days)
    ? (initial.delivery_days as string[])
    : []
  const [deliveryDays, setDeliveryDays] = useState<string[]>(initialDays)

  const { register, handleSubmit, formState } = useForm<FormShape>({
    defaultValues: {
      name: initial?.name ?? '',
      contact_name: initial?.contact_name ?? '',
      email: initial?.email ?? '',
      phone: initial?.phone ?? '',
      address: initial?.address ?? '',
      tax_id: initial?.tax_id ?? '',
      payment_terms: initial?.payment_terms ?? '',
      min_order_amount: initial?.min_order_amount ?? null,
      rating: initial?.rating ?? 0,
      notes: initial?.notes ?? '',
      is_active: initial?.is_active ?? true,
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

  const toggleDay = (day: string) => {
    setDeliveryDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const onSubmit = handleSubmit(async (values) => {
    setZodError(null)
    const candidate: SupplierInput = {
      hotel_id: hotelId,
      name: values.name.trim(),
      contact_name: toStrOrNull(values.contact_name),
      email: toStrOrNull(values.email) ?? undefined,
      phone: toStrOrNull(values.phone),
      address: toStrOrNull(values.address),
      tax_id: toStrOrNull(values.tax_id),
      payment_terms: toStrOrNull(values.payment_terms),
      delivery_days: deliveryDays,
      min_order_amount: toNumOrNull(values.min_order_amount),
      rating: Number(values.rating) || 0,
      notes: toStrOrNull(values.notes),
      is_active: values.is_active,
    }

    const parsed = supplierInputSchema.safeParse(candidate)
    if (!parsed.success) {
      setZodError(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' · '))
      return
    }

    try {
      const supplier = initial
        ? await update.mutateAsync({ ...parsed.data, id: initial.id, hotel_id: hotelId })
        : await create.mutateAsync(parsed.data)
      if (onDone) onDone(supplier)
      else router.push(`/catalog/suppliers/${supplier.id}`)
    } catch (e) {
      console.error(e)
    }
  })

  const isPending = formState.isSubmitting || create.isPending || update.isPending

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="kpi-label mb-1 block">Nombre *</label>
          <input
            {...register('name', { required: true })}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
        <div>
          <label className="kpi-label mb-1 block">Contacto</label>
          <input
            {...register('contact_name')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
        <div>
          <label className="kpi-label mb-1 block">Email</label>
          <input
            type="email"
            {...register('email')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
        <div>
          <label className="kpi-label mb-1 block">Teléfono</label>
          <input
            {...register('phone')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
        <div className="md:col-span-2">
          <label className="kpi-label mb-1 block">Dirección</label>
          <input
            {...register('address')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
        <div>
          <label className="kpi-label mb-1 block">NIF / CIF</label>
          <input
            {...register('tax_id')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
        <div>
          <label className="kpi-label mb-1 block">Términos de pago</label>
          <input
            placeholder="ej. 30 días"
            {...register('payment_terms')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
        <div>
          <label className="kpi-label mb-1 block">Pedido mínimo (€)</label>
          <input
            type="number"
            step="any"
            {...register('min_order_amount')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
        <div>
          <label className="kpi-label mb-1 block">Rating (0-5)</label>
          <input
            type="number"
            step="0.1"
            min={0}
            max={5}
            {...register('rating', { valueAsNumber: true })}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
      </div>

      <div>
        <p className="kpi-label mb-2">Días de reparto</p>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((d) => (
            <button
              type="button"
              key={d.key}
              onClick={() => toggleDay(d.key)}
              className={`rounded border px-3 py-1 text-sm transition-colors ${
                deliveryDays.includes(d.key)
                  ? 'bg-accent text-[color:var(--accent-fg)]'
                  : 'hover:bg-[color:var(--color-bg-hover)]'
              }`}
              style={{ borderColor: 'var(--color-border)' }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="kpi-label mb-1 block">Notas</label>
        <textarea
          {...register('notes')}
          rows={3}
          className="w-full rounded border px-3 py-2 text-sm"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
        />
      </div>

      {zodError && <p className="text-sm text-danger">{zodError}</p>}
      {(create.error || update.error) && (
        <p className="text-sm text-danger">
          {String((create.error ?? update.error)?.message)}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isPending}>
          {initial ? 'Guardar cambios' : 'Crear proveedor'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
