'use client'

import Link from 'next/link'
import { useEventsInfinite } from '../application/use-events'
import type { EventsFilter } from '../domain/types'
import { EVENT_TYPE_LABELS } from '../domain/invariants'
import { EventStatusBadge } from './event-status-badge'
import { Button } from '@/components/ui/button'

interface Props {
  hotelId: string
  filter?: EventsFilter
}

export function EventsList({ hotelId, filter }: Props) {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useEventsInfinite(hotelId, filter)

  if (isLoading) return <p className="kpi-label">Cargando eventos…</p>
  if (error) return <p className="text-danger">No se pudieron cargar los eventos.</p>
  const items = data?.pages.flatMap((p) => p.rows) ?? []
  if (items.length === 0) {
    return <p className="text-[color:var(--color-text-muted)]">No hay eventos en este rango.</p>
  }

  return (
    <div className="space-y-3">
      <div
        className="overflow-hidden rounded border"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              className="text-left"
              style={{ background: 'var(--color-bg-sidebar)', color: 'var(--color-text-muted)' }}
            >
              <th className="kpi-label px-3 py-2">Fecha</th>
              <th className="kpi-label px-3 py-2">Nombre</th>
              <th className="kpi-label px-3 py-2">Tipo</th>
              <th className="kpi-label px-3 py-2 text-right">Pax</th>
              <th className="kpi-label px-3 py-2">Venue</th>
              <th className="kpi-label px-3 py-2">Estado</th>
              <th className="kpi-label px-3 py-2">BEO</th>
            </tr>
          </thead>
          <tbody>
            {items.map((ev) => (
              <tr
                key={ev.id}
                className="border-t transition-colors hover:bg-[color:var(--color-bg-hover)]"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <td className="px-3 py-2 font-data">{ev.event_date}</td>
                <td className="px-3 py-2">
                  <Link href={`/events/${ev.id}`} className="underline-offset-4 hover:underline">
                    {ev.name}
                  </Link>
                </td>
                <td className="px-3 py-2">{EVENT_TYPE_LABELS[ev.event_type]}</td>
                <td className="px-3 py-2 text-right font-data">{ev.guest_count}</td>
                <td className="px-3 py-2 text-[color:var(--color-text-secondary)]">
                  {ev.venue ?? '—'}
                </td>
                <td className="px-3 py-2">
                  <EventStatusBadge status={ev.status} />
                </td>
                <td className="px-3 py-2 font-code text-xs text-[color:var(--color-text-muted)]">
                  {ev.beo_number ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            size="sm"
            variant="ghost"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage ? 'Cargando…' : 'Cargar más'}
          </Button>
        </div>
      )}
    </div>
  )
}
