import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { ProductionCancelForm } from '@/features/production/components/production-cancel-form'

export const dynamic = 'force-dynamic'

export default async function CancelProductionOrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [{ id }, activeHotel] = await Promise.all([params, getActiveHotelOrNull()])
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href={`/production/${id}`} className="hover:underline">
              Orden
            </Link>
          </p>
          <h1>Cancelar orden · {activeHotel.hotel_name}</h1>
        </header>

        <ProductionCancelForm hotelId={activeHotel.hotel_id} orderId={id} />
      </div>
    </main>
  )
}
