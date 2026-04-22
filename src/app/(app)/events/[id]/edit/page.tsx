import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { fetchEvent } from '@/features/commercial/infrastructure/event-queries'
import { EventNotFoundError } from '@/features/commercial'
import { EventForm } from '@/features/commercial/components/event-form'

export const dynamic = 'force-dynamic'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  const supabase = await createClient()
  let event
  try {
    event = await fetchEvent(supabase, activeHotel.hotel_id, id)
  } catch (err) {
    if (err instanceof EventNotFoundError) notFound()
    throw err
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href={`/events/${id}`} className="hover:underline">
              ← Volver al evento
            </Link>
          </p>
          <h1>Editar evento</h1>
        </header>

        <section
          className="rounded-lg border p-6"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          <EventForm hotelId={activeHotel.hotel_id} event={event} />
        </section>
      </div>
    </main>
  )
}
