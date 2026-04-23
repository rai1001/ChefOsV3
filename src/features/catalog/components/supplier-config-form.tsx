'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  supplierConfigInputSchema,
  type SupplierConfigInput,
} from '../domain/schemas'
import {
  useSupplierConfig,
  useUpsertSupplierConfig,
} from '../application/use-supplier-config'
import { Button } from '@/components/ui/button'

interface Props {
  hotelId: string
  supplierId: string
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
  cutoff_time?: string | null
  lead_time_hours?: number | null
  min_order_amount?: number | null
  min_order_units?: number | null
  reception_window_start?: string | null
  reception_window_end?: string | null
  allows_urgent_delivery: boolean
}

export function SupplierConfigForm({ hotelId, supplierId }: Props) {
  const { data: config, isLoading } = useSupplierConfig(hotelId, supplierId)
  const upsert = useUpsertSupplierConfig()
  const [zodError, setZodError] = useState<string | null>(null)

  const initialDays = Array.isArray(config?.delivery_days)
    ? (config.delivery_days as string[])
    : []
  const [deliveryDays, setDeliveryDays] = useState<string[]>(initialDays)

  const { register, handleSubmit, formState, reset } = useForm<FormShape>({
    defaultValues: {
      cutoff_time: config?.cutoff_time ?? '',
      lead_time_hours: config?.lead_time_hours ?? null,
      min_order_amount: config?.min_order_amount ?? null,
      min_order_units: config?.min_order_units ?? null,
      reception_window_start: config?.reception_window_start ?? '',
      reception_window_end: config?.reception_window_end ?? '',
      allows_urgent_delivery: config?.allows_urgent_delivery ?? false,
    },
  })

  // Re-sync defaults cuando config llega
  const [synced, setSynced] = useState(false)
  if (!synced && config) {
    reset({
      cutoff_time: config.cutoff_time ?? '',
      lead_time_hours: config.lead_time_hours,
      min_order_amount: config.min_order_amount,
      min_order_units: config.min_order_units,
      reception_window_start: config.reception_window_start ?? '',
      reception_window_end: config.reception_window_end ?? '',
      allows_urgent_delivery: config.allows_urgent_delivery,
    })
    setDeliveryDays(
      Array.isArray(config.delivery_days) ? (config.delivery_days as string[]) : []
    )
    setSynced(true)
  }

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

  const toggleDay = (day: string) =>
    setDeliveryDays((p) => (p.includes(day) ? p.filter((d) => d !== day) : [...p, day]))

  const onSubmit = handleSubmit(async (values) => {
    setZodError(null)
    const candidate: SupplierConfigInput = {
      hotel_id: hotelId,
      supplier_id: supplierId,
      delivery_days: deliveryDays,
      cutoff_time: toStrOrNull(values.cutoff_time),
      lead_time_hours: toNumOrNull(values.lead_time_hours),
      min_order_amount: toNumOrNull(values.min_order_amount),
      min_order_units: toNumOrNull(values.min_order_units),
      reception_window_start: toStrOrNull(values.reception_window_start),
      reception_window_end: toStrOrNull(values.reception_window_end),
      allows_urgent_delivery: values.allows_urgent_delivery,
    }

    const parsed = supplierConfigInputSchema.safeParse(candidate)
    if (!parsed.success) {
      setZodError(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' · '))
      return
    }

    try {
      await upsert.mutateAsync(parsed.data)
    } catch (e) {
      console.error(e)
    }
  })

  if (isLoading) return <p className="kpi-label">Cargando configuración…</p>

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="kpi-label mb-1 block">Hora de corte de pedido</label>
          <input
            type="time"
            {...register('cutoff_time')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
        <div>
          <label className="kpi-label mb-1 block">Lead time (horas)</label>
          <input
            type="number"
            min={1}
            {...register('lead_time_hours')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('allows_urgent_delivery')} />
            Permite pedido urgente
          </label>
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
          <label className="kpi-label mb-1 block">Pedido mínimo (uds)</label>
          <input
            type="number"
            step="any"
            {...register('min_order_units')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>

        <div>
          <label className="kpi-label mb-1 block">Ventana recepción: inicio</label>
          <input
            type="time"
            {...register('reception_window_start')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
        <div>
          <label className="kpi-label mb-1 block">Ventana recepción: fin</label>
          <input
            type="time"
            {...register('reception_window_end')}
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

      {zodError && <p className="text-sm text-danger">{zodError}</p>}
      {upsert.error && <p className="text-sm text-danger">{String(upsert.error.message)}</p>}

      <div>
        <Button type="submit" disabled={formState.isSubmitting || upsert.isPending}>
          Guardar configuración
        </Button>
      </div>
    </form>
  )
}
