import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { UnitsPanel } from '@/features/catalog/components/units-panel'

export const dynamic = 'force-dynamic'

export default async function CatalogUnitsPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/catalog" className="hover:underline">
              ← Catálogo
            </Link>
          </p>
          <h1>Unidades · {activeHotel.hotel_name}</h1>
          <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">
            Catálogo de unidades por hotel. Edición restringida a superadmin/direction (sprint-04b).
          </p>
        </header>

        <UnitsPanel hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}
