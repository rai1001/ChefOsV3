import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { ImportRecipesForm } from '@/features/import'

export const dynamic = 'force-dynamic'

export default async function ImportRecipesPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/recipes" className="hover:underline">
              ← Recetas
            </Link>
          </p>
          <h1>Importar recetas desde Excel</h1>
          <p className="text-sm text-[color:var(--color-text-muted)] mt-2 max-w-3xl">
            Sube un .xlsx con dos hojas: <span className="font-data">Recetas</span> y{' '}
            <span className="font-data">Ingredientes</span>. Las recetas válidas se crean en estado{' '}
            <strong>borrador</strong>. Los ingredientes quedan con mapping a producto pendiente —
            los completarás cuando exista el catálogo de productos.
          </p>
        </header>

        <section
          className="rounded-lg border p-6"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          <ImportRecipesForm hotelId={activeHotel.hotel_id} />
        </section>
      </div>
    </main>
  )
}
