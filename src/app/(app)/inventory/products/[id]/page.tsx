import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { InventoryProductDetail } from '@/features/inventory/components/inventory-product-detail'

export const dynamic = 'force-dynamic'

export default async function InventoryProductPage({
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
            <Link href="/inventory" className="hover:underline">
              Inventario
            </Link>
          </p>
          <h1>Detalle de producto · {activeHotel.hotel_name}</h1>
        </header>

        <InventoryProductDetail hotelId={activeHotel.hotel_id} productId={id} />
      </div>
    </main>
  )
}
