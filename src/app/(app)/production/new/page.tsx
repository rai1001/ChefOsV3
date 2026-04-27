import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { ProductionOrderForm } from '@/features/production/components/production-order-form'

export const dynamic = 'force-dynamic'

export default async function NewProductionOrderPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/production" className="hover:underline">
              Producción
            </Link>
          </p>
          <h1>Nueva orden · {activeHotel.hotel_name}</h1>
        </header>

        <ProductionOrderForm hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}
