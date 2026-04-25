import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { MappingTable } from '@/features/catalog/components/mapping-table'

export const dynamic = 'force-dynamic'

export default async function RecipesMappingPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/recipes" className="hover:underline">
              ← Recetas
            </Link>
          </p>
          <h1>Mapping de ingredientes</h1>
          <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">
            Vincula ingredientes importados a productos y unidades reales del catálogo. El matching por alias usa búsqueda trigram sobre el namespace v3_.
          </p>
        </header>

        <MappingTable hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}
