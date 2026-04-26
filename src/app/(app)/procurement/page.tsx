import Link from 'next/link'
import { ShoppingCart, ClipboardList } from 'lucide-react'
import { getActiveHotelOrNull } from '@/features/identity/server'

export const dynamic = 'force-dynamic'

export default async function ProcurementPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/" className="hover:underline">
              Dashboard
            </Link>
          </p>
          <h1>Compras · {activeHotel.hotel_name}</h1>
          <p className="mt-2 text-[color:var(--color-text-muted)]">
            Solicitudes, consolidacion por proveedor y pedidos base.
          </p>
        </header>

        <nav
          className="grid gap-3 md:grid-cols-2 rounded border p-4"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          <Link
            href="/procurement/purchase-requests"
            className="rounded border p-4 transition-colors hover:bg-[color:var(--color-bg-hover)]"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <ClipboardList className="mb-3 h-5 w-5" aria-hidden="true" />
            <p className="kpi-label">Solicitudes</p>
            <p className="text-sm text-[color:var(--color-text-muted)]">
              Necesidades manuales y generadas desde eventos confirmados.
            </p>
          </Link>
          <Link
            href="/procurement/purchase-orders"
            className="rounded border p-4 transition-colors hover:bg-[color:var(--color-bg-hover)]"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <ShoppingCart className="mb-3 h-5 w-5" aria-hidden="true" />
            <p className="kpi-label">Pedidos</p>
            <p className="text-sm text-[color:var(--color-text-muted)]">
              POs agrupadas por proveedor desde solicitudes aprobadas.
            </p>
          </Link>
        </nav>
      </div>
    </main>
  )
}
