import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { EventForm } from '@/features/commercial/components/event-form'

export const dynamic = 'force-dynamic'

export default async function NewEventPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/events" className="hover:underline">
              ← Eventos
            </Link>
          </p>
          <h1>Nuevo evento</h1>
        </header>

        <section
          className="rounded-lg border p-6"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          <EventForm hotelId={activeHotel.hotel_id} />
        </section>
      </div>
    </main>
  )
}
