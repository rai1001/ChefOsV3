import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { Button } from '@/components/ui/button'
import { EventsView } from '@/features/commercial/components/events-view'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="kpi-label">Commercial</p>
            <h1>Eventos · {activeHotel.hotel_name}</h1>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/events/clients">Clientes</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/events/new">Nuevo evento</Link>
            </Button>
          </div>
        </header>

        <EventsView hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}
