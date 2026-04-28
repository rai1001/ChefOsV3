import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { TransferLotForm } from '@/features/warehouse/components/transfer-lot-form'

export const dynamic = 'force-dynamic'

export default async function InventoryTransferPage() {
  const activeHotel = await getActiveHotelOrNull()
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
          <h1>Transferir stock · {activeHotel.hotel_name}</h1>
        </header>

        <TransferLotForm hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}
