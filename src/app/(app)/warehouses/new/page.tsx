import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { WarehouseForm } from '@/features/warehouse/components/warehouse-form'

export const dynamic = 'force-dynamic'

export default async function NewWarehousePage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/warehouses" className="hover:underline">
              Almacenes
            </Link>
          </p>
          <h1>Nuevo almacén · {activeHotel.hotel_name}</h1>
        </header>

        <WarehouseForm hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}
