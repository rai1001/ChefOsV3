import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { ClientForm } from '@/features/commercial/components/client-form'

export const dynamic = 'force-dynamic'

export default async function NewClientPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/events/clients" className="hover:underline">
              ← Clientes
            </Link>
          </p>
          <h1>Nuevo cliente</h1>
        </header>

        <section
          className="rounded-lg border p-6"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          <ClientForm hotelId={activeHotel.hotel_id} />
        </section>
      </div>
    </main>
  )
}
