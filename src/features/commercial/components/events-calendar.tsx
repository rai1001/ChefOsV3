'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEventsCalendar } from '../application/use-events-calendar'
import type { CalendarEvent } from '../domain/types'
import { EVENT_STATUS_VARIANT } from '../domain/invariants'

const WEEK_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function variantClass(v: ReturnType<typeof variantClassFor>) {
  return v
}

function variantClassFor(status: CalendarEvent['status']) {
  const variant = EVENT_STATUS_VARIANT[status]
  switch (variant) {
    case 'success':
      return 'text-[color:var(--color-success-fg)] border-[color:var(--success-border)] bg-[color:var(--success-bg)]'
    case 'warning':
      return 'text-[color:var(--color-warning-fg)] border-[color:var(--warning-border)] bg-[color:var(--warning-bg)]'
    case 'info':
      return 'text-[color:var(--color-info-fg)] border-[color:var(--info-border)] bg-[color:var(--info-bg)]'
    case 'urgent':
      return 'text-[color:var(--color-danger-fg)] border-[color:var(--urgent-border)] bg-[color:var(--urgent-bg)]'
    case 'neutral':
    default:
      return 'text-[color:var(--color-text-secondary)] border-[color:var(--color-border)] bg-[color:var(--color-bg-card)]'
  }
}

interface Props {
  hotelId: string
}

export function EventsCalendar({ hotelId }: Props) {
  const [cursor, setCursor] = useState<Date>(new Date())

  const { from, to, days } = useMemo(() => {
    const monthStart = startOfMonth(cursor)
    const monthEnd = endOfMonth(cursor)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return {
      from: format(monthStart, 'yyyy-MM-dd'),
      to: format(monthEnd, 'yyyy-MM-dd'),
      days: eachDayOfInterval({ start: gridStart, end: gridEnd }),
    }
  }, [cursor])

  const { data, isLoading } = useEventsCalendar(hotelId, from, to)

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const ev of data ?? []) {
      const key = ev.event_date
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(ev)
    }
    return map
  }, [data])

  const monthLabel = format(cursor, 'LLLL yyyy', { locale: es })

  return (
    <div
      className="rounded border p-4"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold capitalize">{monthLabel}</h2>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setCursor(subMonths(cursor, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCursor(new Date())}>
            Hoy
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setCursor(addMonths(cursor, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEK_LABELS.map((d) => (
          <div key={d} className="kpi-label py-1">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const events = eventsByDay.get(key) ?? []
          const inMonth = isSameMonth(day, cursor)
          const isToday = isSameDay(day, new Date())
          return (
            <div
              key={key}
              className={`min-h-[96px] rounded border p-1 text-left text-xs ${inMonth ? '' : 'opacity-50'}`}
              style={{
                borderColor: isToday ? 'var(--color-border-focus)' : 'var(--color-border)',
                background: 'var(--color-bg-primary)',
              }}
            >
              <div className="flex items-center justify-between font-data text-[11px]">
                <span className={isToday ? 'font-bold text-[color:var(--color-accent)]' : ''}>
                  {format(day, 'd')}
                </span>
                {events.length > 0 && (
                  <span className="kpi-label">{events.length}</span>
                )}
              </div>
              <div className="mt-1 space-y-0.5">
                {events.slice(0, 3).map((ev) => (
                  <Link
                    key={ev.id}
                    href={`/events/${ev.id}`}
                    className={`block truncate rounded border px-1 py-0.5 text-[10px] ${variantClass(variantClassFor(ev.status))}`}
                    title={`${ev.name} (${ev.guest_count} pax)`}
                  >
                    {ev.name}
                  </Link>
                ))}
                {events.length > 3 && (
                  <span className="kpi-label text-[10px]">+{events.length - 3}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {isLoading && (
        <p className="mt-3 kpi-label">Cargando calendario…</p>
      )}
    </div>
  )
}
