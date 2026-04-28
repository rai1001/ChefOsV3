import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { WarehouseList } from '@/features/warehouse/components/warehouse-list'

export const dynamic = 'force-dynamic'

export default async function WarehousesPage() {
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
          <h1>Almacenes · {activeHotel.hotel_name}</h1>
        </header>

        <WarehouseList hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}
