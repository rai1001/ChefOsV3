import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { GoodsReceiptsList } from '@/features/procurement/components/goods-receipts-list'

export const dynamic = 'force-dynamic'

export default async function GoodsReceiptsPage() {
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
          <h1>Recepciones · {activeHotel.hotel_name}</h1>
        </header>

        <GoodsReceiptsList hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}
