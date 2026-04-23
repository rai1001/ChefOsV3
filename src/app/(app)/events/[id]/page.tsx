import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { getEventDetailServer } from '@/features/commercial/server'
import { EVENT_TYPE_LABELS, SERVICE_TYPE_LABELS } from '@/features/commercial'
import { EventNotFoundError } from '@/features/commercial'
import { Button } from '@/components/ui/button'
import { EventStatusBadge } from '@/features/commercial/components/event-status-badge'
import { EventTransitionButtons } from '@/features/commercial/components/event-transition-buttons'
import { BeoDownloadButton } from '@/features/commercial/components/beo-download-button'

export const dynamic = 'force-dynamic'

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  let event
  let spaces
  let menus
  try {
    const detail = await getEventDetailServer(activeHotel.hotel_id, id)
    event = detail.event
    spaces = detail.spaces
    menus = detail.menus
  } catch (err) {
    if (err instanceof EventNotFoundError) notFound()
    throw err
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <p className="kpi-label">
              <Link href="/events" className="hover:underline">
                ← Eventos
              </Link>
            </p>
            <h1>{event.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <EventStatusBadge status={event.status} />
              <span className="badge-status neutral">{EVENT_TYPE_LABELS[event.event_type]}</span>
              <span className="badge-status neutral">
                {SERVICE_TYPE_LABELS[event.service_type]}
              </span>
              {event.beo_number && (
                <span className="badge-status info font-code">{event.beo_number}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href={`/events/${id}/edit`}>Editar</Link>
            </Button>
            <BeoDownloadButton hotelId={activeHotel.hotel_id} eventId={id} />
          </div>
        </header>

        <section
          className="grid gap-4 rounded-lg border p-6 md:grid-cols-2"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          <div>
            <p className="kpi-label">Fecha</p>
            <p className="font-data">{event.event_date}</p>
          </div>
          <div>
            <p className="kpi-label">Horario</p>
            <p className="font-data">
              {event.start_time ?? '—'} – {event.end_time ?? '—'}
            </p>
          </div>
          <div>
            <p className="kpi-label">Pax</p>
            <p className="font-data">{event.guest_count}</p>
          </div>
          <div>
            <p className="kpi-label">Venue</p>
            <p>{event.venue ?? '—'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="kpi-label">Notas</p>
            <p className="whitespace-pre-wrap text-[color:var(--color-text-secondary)]">
              {event.notes ?? '—'}
            </p>
          </div>
          <div>
            <p className="kpi-label">Coste teórico</p>
            <p className="font-data">
              {event.theoretical_cost != null
                ? event.theoretical_cost.toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                  })
                : '—'}
            </p>
          </div>
          <div>
            <p className="kpi-label">Coste real</p>
            <p className="font-data">
              {event.actual_cost != null
                ? event.actual_cost.toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                  })
                : '—'}
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2>Transiciones</h2>
          <EventTransitionButtons
            hotelId={activeHotel.hotel_id}
            eventId={id}
            currentStatus={event.status}
            menuCount={menus.length}
          />
        </section>

        <section className="space-y-3">
          <h2>Espacios</h2>
          {spaces.length === 0 ? (
            <p className="text-[color:var(--color-text-muted)]">Sin espacios asignados.</p>
          ) : (
            <ul className="space-y-2">
              {spaces.map((sp) => (
                <li
                  key={sp.id}
                  className="rounded border px-3 py-2"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <span className="font-medium">{sp.space_name}</span>
                  {sp.capacity && <span className="kpi-label ml-2">{sp.capacity} pax</span>}
                  {sp.setup_style && <span className="kpi-label ml-2">{sp.setup_style}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <h2>Menús</h2>
          {menus.length === 0 ? (
            <p className="text-[color:var(--color-text-muted)]">Sin menús asignados.</p>
          ) : (
            <ul className="space-y-2">
              {menus.map((m) => (
                <li
                  key={m.id}
                  className="rounded border px-3 py-2 flex justify-between"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <span>{m.menu_name}</span>
                  <span className="kpi-label">{m.servings_override ?? event.guest_count} pax</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
