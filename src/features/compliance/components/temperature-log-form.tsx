'use client'

import { useMemo, useState } from 'react'
import { Save, Thermometer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { ComplianceDateRange } from '../domain/filters'
import { EQUIPMENT_TYPE_LABELS } from '../domain/schemas'
import { useEquipmentList } from '../application/use-equipment-list'
import { useLogEquipmentTemperature } from '../application/use-temperature-log'
import { useTemperatureLogList } from '../application/use-temperature-log-list'

export function TemperatureLogForm({
  hotelId,
  selectedEquipmentId,
  onEquipmentChange,
}: {
  hotelId: string
  selectedEquipmentId?: string
  onEquipmentChange?: (equipmentId: string) => void
}) {
  const equipment = useEquipmentList(hotelId)
  const mutation = useLogEquipmentTemperature()
  const [internalEquipmentId, setInternalEquipmentId] = useState('')
  const [temperature, setTemperature] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fallbackEquipmentId = internalEquipmentId || equipment.data?.[0]?.id || ''
  const equipmentId = selectedEquipmentId ?? fallbackEquipmentId

  function setEquipmentId(next: string) {
    if (onEquipmentChange) onEquipmentChange(next)
    setInternalEquipmentId(next)
  }

  async function submit() {
    if (!equipmentId) {
      setError('Equipo obligatorio')
      return
    }
    if (temperature.trim() === '') {
      setError('Temperatura obligatoria')
      return
    }

    setError(null)
    await mutation.mutateAsync({
      hotel_id: hotelId,
      equipment_id: equipmentId,
      temperature_c: Number(temperature),
      notes,
    })
    setTemperature('')
    setNotes('')
  }

  return (
    <section
      className="rounded border p-4"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
    >
      <div className="mb-4 flex items-center gap-2">
        <Thermometer className="h-5 w-5" aria-hidden="true" />
        <h2>Registro rápido</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="kpi-label mb-1 block">Equipo</span>
          <select
            value={equipmentId}
            onChange={(event) => setEquipmentId(event.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-input)' }}
          >
            <option value="">Selecciona equipo</option>
            {(equipment.data ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {EQUIPMENT_TYPE_LABELS[item.equipment_type]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="kpi-label mb-1 block">Temperatura °C</span>
          <Input
            type="number"
            step="0.01"
            value={temperature}
            onChange={(event) => setTemperature(event.target.value)}
          />
        </label>
        <label className="block">
          <span className="kpi-label mb-1 block">Notas</span>
          <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} />
        </label>
      </div>
      <Button type="button" onClick={submit} disabled={mutation.isPending} className="mt-4">
        <Save className="h-4 w-4" aria-hidden="true" />
        Registrar
      </Button>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {equipment.error ? <p className="mt-3 text-sm text-danger">{equipment.error.message}</p> : null}
      {mutation.error ? <p className="mt-3 text-sm text-danger">{mutation.error.message}</p> : null}
    </section>
  )
}

export function TemperatureLogPanel({
  hotelId,
  range,
}: {
  hotelId: string
  range: ComplianceDateRange
}) {
  const equipment = useEquipmentList(hotelId)
  const [equipmentId, setEquipmentId] = useState('')
  const effectiveEquipmentId = equipmentId || equipment.data?.[0]?.id
  const filter = useMemo(
    () => ({ hotelId, ...range, equipmentId: effectiveEquipmentId }),
    [effectiveEquipmentId, hotelId, range]
  )
  const logs = useTemperatureLogList(filter)
  const rows = logs.data ?? []

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <TemperatureLogForm
        hotelId={hotelId}
        selectedEquipmentId={effectiveEquipmentId}
        onEquipmentChange={setEquipmentId}
      />
      <section className="space-y-4">
        <h2>Lecturas 7d</h2>
        <TemperatureSparkline
          values={rows.map((row) => ({
            label: new Date(row.measured_at).toLocaleDateString('es-ES'),
            value: row.temperature_c,
            inRange: row.in_range ?? false,
          }))}
        />
        {logs.error ? <p className="text-danger">Error: {logs.error.message}</p> : null}
      </section>
    </div>
  )
}

function TemperatureSparkline({
  values,
}: {
  values: { label: string; value: number; inRange: boolean }[]
}) {
  const width = 640
  const height = 220
  const min = Math.min(...values.map((value) => value.value), 0)
  const max = Math.max(...values.map((value) => value.value), 1)
  const span = max - min || 1
  const step = values.length > 1 ? width / (values.length - 1) : width
  const points = values.map((item, index) => {
    const x = index * step
    const y = height - ((item.value - min) / span) * (height - 32) - 16
    return { ...item, x, y }
  })
  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ')

  return (
    <div
      className="rounded border p-4"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full" role="img" aria-label="Temperaturas 7 días">
        <line x1="0" x2={width} y1={height - 16} y2={height - 16} className="stroke-[color:var(--color-border)]" />
        {path ? <path d={path} fill="none" stroke="var(--color-accent)" strokeWidth="3" /> : null}
        {points.map((point, index) => (
          <circle
            key={`${point.label}-${index}`}
            cx={point.x}
            cy={point.y}
            r="5"
            className={point.inRange ? 'fill-[color:var(--color-accent)]' : 'fill-[color:var(--color-danger)]'}
          />
        ))}
      </svg>
      {values.length === 0 ? <p className="text-sm text-[color:var(--color-text-muted)]">Sin lecturas.</p> : null}
    </div>
  )
}
