import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { ProductionOrderDetail } from '@/features/production/components/production-order-detail'

export const dynamic = 'force-dynamic'

export default async function ProductionOrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [{ id }, activeHotel] = await Promise.all([params, getActiveHotelOrNull()])
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
          <h1>Detalle de orden · {activeHotel.hotel_name}</h1>
        </header>

        <ProductionOrderDetail hotelId={activeHotel.hotel_id} orderId={id} />
      </div>
    </main>
  )
}
