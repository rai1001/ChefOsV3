import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { InventorySnapshotList } from '@/features/inventory/components/inventory-snapshot-list'

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/" className="hover:underline">
              Panel
            </Link>
          </p>
          <h1>Inventario · {activeHotel.hotel_name}</h1>
        </header>

        <InventorySnapshotList hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}
