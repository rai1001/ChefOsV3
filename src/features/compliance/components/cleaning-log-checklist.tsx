'use client'

import { useState } from 'react'
import { Check, ClipboardCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { todayDateOnly } from '../domain/shared'
import { FREQUENCY_LABELS } from '../domain/schemas'
import { useCleaningAreaList } from '../application/use-cleaning-area-list'
import { useCompleteCleaningCheck } from '../application/use-cleaning-log'

export function CleaningLogChecklist({
  hotelId,
  today = todayDateOnly(),
}: {
  hotelId: string
  today?: string
}) {
  const areas = useCleaningAreaList(hotelId)
  const mutation = useCompleteCleaningCheck()
  const [notesByArea, setNotesByArea] = useState<Record<string, string>>({})
  const [completedAreaIds, setCompletedAreaIds] = useState<Set<string>>(() => new Set())

  async function complete(areaId: string) {
    setCompletedAreaIds((current) => new Set(current).add(areaId))
    await mutation.mutateAsync({
      hotel_id: hotelId,
      area_id: areaId,
      due_date: today,
      notes: notesByArea[areaId] ?? null,
    })
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
        <h2>Checklist de hoy</h2>
      </div>
      {areas.isLoading ? <p className="kpi-label">Cargando áreas...</p> : null}
      {areas.error ? <p className="text-danger">Error: {areas.error.message}</p> : null}
      <div className="grid gap-3">
        {(areas.data ?? []).map((area) => {
          const completed = completedAreaIds.has(area.id)
          return (
            <div
              key={area.id}
              className="rounded border p-4"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3>{area.name}</h3>
                  <p className="kpi-label">{FREQUENCY_LABELS[area.frequency]}</p>
                </div>
                {completed ? (
                  <span className="badge-status neutral">Completado</span>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void complete(area.id)}
                    aria-label={`Completar ${area.name}`}
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Completar
                  </Button>
                )}
              </div>
              <label className="mt-3 block">
                <span className="kpi-label mb-1 block">Notas</span>
                <Textarea
                  value={notesByArea[area.id] ?? ''}
                  onChange={(event) =>
                    setNotesByArea((current) => ({ ...current, [area.id]: event.target.value }))
                  }
                  rows={2}
                  disabled={completed}
                />
              </label>
            </div>
          )
        })}
      </div>
      {mutation.error ? <p className="text-danger">Error: {mutation.error.message}</p> : null}
    </section>
  )
}

