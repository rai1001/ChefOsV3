import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { Button } from '@/components/ui/button'
import { ClientsList } from '@/features/commercial/components/clients-list'

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="kpi-label">
              <Link href="/events" className="hover:underline">
                ← Eventos
              </Link>
            </p>
            <h1>Clientes</h1>
          </div>
          <Button asChild size="sm">
            <Link href="/events/clients/new">Nuevo cliente</Link>
          </Button>
        </header>

        <ClientsList hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}
