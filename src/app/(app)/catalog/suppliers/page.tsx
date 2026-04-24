import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { SuppliersList } from '@/features/catalog/components/suppliers-list'

export const dynamic = 'force-dynamic'

export default async function CatalogSuppliersPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/catalog" className="hover:underline">
              ← Catálogo
            </Link>
          </p>
          <h1>Proveedores · {activeHotel.hotel_name}</h1>
        </header>

        <SuppliersList hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}
