import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { InventoryActionForm } from '@/features/inventory/components/inventory-action-form'

export const dynamic = 'force-dynamic'

export default async function InventoryAdjustmentPage({
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
            <Link href={`/inventory/products/${id}`} className="hover:underline">
              Inventario
            </Link>
          </p>
          <h1>Ajuste de stock · {activeHotel.hotel_name}</h1>
        </header>

        <InventoryActionForm
          hotelId={activeHotel.hotel_id}
          productId={id}
          action="adjustment"
        />
      </div>
    </main>
  )
}
