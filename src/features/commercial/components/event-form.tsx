'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateEvent } from '../application/use-create-event'
import { useUpdateEvent } from '../application/use-update-event'
import { useClients } from '../application/use-clients'
import {
  EVENT_TYPES,
  SERVICE_TYPES,
  type Event,
  type EventType,
  type ServiceType,
} from '../domain/types'
import { EVENT_TYPE_LABELS, SERVICE_TYPE_LABELS } from '../domain/invariants'
import { createEventSchema } from '../application/schemas'

interface Props {
  hotelId: string
  event?: Event
}

export function EventForm({ hotelId, event }: Props) {
  const router = useRouter()
  const create = useCreateEvent(hotelId)
  const update = useUpdateEvent(hotelId)
  const clients = useClients(hotelId)
  const isEdit = !!event

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [eventType, setEventType] = useState<EventType>(event?.event_type ?? 'banquet')
  const [serviceType, setServiceType] = useState<ServiceType>(event?.service_type ?? 'seated')
  const [clientId, setClientId] = useState<string>(event?.client_id ?? '')

  const pending = create.isPending || update.isPending

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})
    setFormError(null)
    const data = new FormData(e.currentTarget)
    const raw = {
      name: data.get('name'),
      event_type: eventType,
      service_type: serviceType,
      event_date: data.get('event_date'),
      guest_count: data.get('guest_count'),
      client_id: clientId || null,
      start_time: (data.get('start_time') as string) || null,
      end_time: (data.get('end_time') as string) || null,
      venue: (data.get('venue') as string) || null,
      notes: (data.get('notes') as string) || null,
    }
    const parsed = createEventSchema.safeParse(raw)
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors)
      return
    }

    try {
      if (isEdit && event) {
        await update.mutateAsync({ eventId: event.id, input: parsed.data })
        router.push(`/events/${event.id}`)
      } else {
        const newId = await create.mutateAsync(parsed.data)
        router.push(`/events/${newId}`)
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error guardando evento')
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="name">Nombre del evento</Label>
          <Input id="name" name="name" required defaultValue={event?.name} autoFocus />
          {fieldErrors.name && <p className="text-xs text-danger">{fieldErrors.name[0]}</p>}
        </div>

        <div className="space-y-1">
          <Label>Tipo</Label>
          <Select value={eventType} onValueChange={(v) => setEventType(v as EventType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {EVENT_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Servicio</Label>
          <Select value={serviceType} onValueChange={(v) => setServiceType(v as ServiceType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_TYPES.map((s) => (
                <SelectItem key={s} value={s}>
                  {SERVICE_TYPE_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="event_date">Fecha</Label>
          <Input
            id="event_date"
            name="event_date"
            type="date"
            required
            defaultValue={event?.event_date}
          />
          {fieldErrors.event_date && (
            <p className="text-xs text-danger">{fieldErrors.event_date[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="guest_count">Invitados (pax)</Label>
          <Input
            id="guest_count"
            name="guest_count"
            type="number"
            min={1}
            required
            defaultValue={event?.guest_count}
          />
          {fieldErrors.guest_count && (
            <p className="text-xs text-danger">{fieldErrors.guest_count[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="start_time">Hora inicio</Label>
          <Input
            id="start_time"
            name="start_time"
            type="time"
            defaultValue={event?.start_time ?? ''}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="end_time">Hora fin</Label>
          <Input id="end_time" name="end_time" type="time" defaultValue={event?.end_time ?? ''} />
        </div>

        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="venue">Venue / espacio</Label>
          <Input id="venue" name="venue" defaultValue={event?.venue ?? ''} />
        </div>

        <div className="space-y-1 md:col-span-2">
          <Label>Cliente</Label>
          <Select
            value={clientId || '__none__'}
            onValueChange={(v) => setClientId(v === '__none__' ? '' : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sin cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Sin cliente</SelectItem>
              {(clients.data?.rows ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} {c.company ? `· ${c.company}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea id="notes" name="notes" rows={3} defaultValue={event?.notes ?? ''} />
        </div>
      </div>

      {formError && (
        <div
          className="rounded border p-3 text-sm"
          style={{
            borderColor: 'var(--urgent-border)',
            background: 'var(--urgent-bg)',
            color: 'var(--color-danger-fg)',
          }}
        >
          {formError}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear evento'}
        </Button>
      </div>
    </form>
  )
}
