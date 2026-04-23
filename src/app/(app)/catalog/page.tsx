import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'

export const dynamic = 'force-dynamic'

export default async function CatalogPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/" className="hover:underline">
              ← Dashboard
            </Link>
          </p>
          <h1>Catálogo · {activeHotel.hotel_name}</h1>
          <p className="mt-2 text-[color:var(--color-text-muted)]">
            Productos, unidades y alias del hotel. Los proveedores y ofertas llegan en sprint-04b.
          </p>
        </header>

        <nav
          className="grid gap-3 md:grid-cols-3 rounded border p-4"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          <Link
            href="/catalog/products"
            className="rounded border p-4 transition-colors hover:bg-[color:var(--color-bg-hover)]"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <p className="kpi-label">Productos</p>
            <p className="text-sm text-[color:var(--color-text-muted)]">
              Maestro de productos, alérgenos, stock.
            </p>
          </Link>
          <Link
            href="/catalog/units"
            className="rounded border p-4 transition-colors hover:bg-[color:var(--color-bg-hover)]"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <p className="kpi-label">Unidades</p>
            <p className="text-sm text-[color:var(--color-text-muted)]">
              Unidades de medida del hotel.
            </p>
          </Link>
          <Link
            href="/recipes/mapping"
            className="rounded border p-4 transition-colors hover:bg-[color:var(--color-bg-hover)]"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <p className="kpi-label">Mapping ingredientes</p>
            <p className="text-sm text-[color:var(--color-text-muted)]">
              Vincular ingredientes sin mapear a productos y unidades.
            </p>
          </Link>
        </nav>
      </div>
    </main>
  )
}
