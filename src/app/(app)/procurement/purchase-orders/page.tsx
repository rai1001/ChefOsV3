import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { PurchaseOrdersList } from '@/features/procurement/components/purchase-orders-list'

export const dynamic = 'force-dynamic'

export default async function PurchaseOrdersPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/procurement" className="hover:underline">
              Compras
            </Link>
          </p>
          <h1>Pedidos · {activeHotel.hotel_name}</h1>
        </header>

        <PurchaseOrdersList hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}
