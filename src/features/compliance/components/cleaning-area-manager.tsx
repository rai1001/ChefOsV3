'use client'

import { useState } from 'react'
import { ClipboardList, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  COMPLIANCE_FREQUENCIES,
  FREQUENCY_LABELS,
  type ComplianceFrequency,
} from '../domain/schemas'
import { useCleaningAreaList } from '../application/use-cleaning-area-list'
import {
  useCreateCleaningArea,
  useUpdateCleaningArea,
} from '../application/use-cleaning-area-mutations'

export function CleaningAreaManager({ hotelId }: { hotelId: string }) {
  const areas = useCleaningAreaList(hotelId, { activeOnly: false })
  const createMutation = useCreateCleaningArea()
  const updateMutation = useUpdateCleaningArea()
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState<ComplianceFrequency>('daily')
  const [description, setDescription] = useState('')

  async function create() {
    await createMutation.mutateAsync({
      hotel_id: hotelId,
      name,
      frequency,
      description,
      is_active: true,
    })
    setName('')
    setDescription('')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section
        className="rounded border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList className="h-5 w-5" aria-hidden="true" />
          <h2>Nueva área</h2>
        </div>
        <div className="space-y-3">
          <label className="block">
            <span className="kpi-label mb-1 block">Nombre</span>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="block">
            <span className="kpi-label mb-1 block">Frecuencia</span>
            <select
              value={frequency}
              onChange={(event) => setFrequency(event.target.value as ComplianceFrequency)}
              className="w-full rounded border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-input)' }}
            >
              {COMPLIANCE_FREQUENCIES.map((item) => (
                <option key={item} value={item}>{FREQUENCY_LABELS[item]}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="kpi-label mb-1 block">Descripción</span>
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <Button type="button" onClick={() => void create()} disabled={!name || createMutation.isPending}>
            <Save className="h-4 w-4" aria-hidden="true" />
            Crear
          </Button>
        </div>
        {createMutation.error ? <p className="mt-3 text-sm text-danger">{createMutation.error.message}</p> : null}
      </section>

      <section className="space-y-3">
        <h2>Áreas</h2>
        {(areas.data ?? []).map((area) => (
          <div
            key={area.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded border p-4"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          >
            <div>
              <h3>{area.name}</h3>
              <p className="kpi-label">{FREQUENCY_LABELS[area.frequency]}</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void updateMutation.mutateAsync({
                id: area.id,
                hotel_id: area.hotel_id,
                is_active: !area.is_active,
              })}
            >
              {area.is_active ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        ))}
        {areas.error ? <p className="text-danger">Error: {areas.error.message}</p> : null}
      </section>
    </div>
  )
}
