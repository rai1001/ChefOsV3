import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { GoodsReceiptDetail } from '@/features/procurement/components/goods-receipt-detail'

export const dynamic = 'force-dynamic'

export default async function GoodsReceiptDetailPage({
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
            <Link href="/procurement/goods-receipts" className="hover:underline">
              Recepciones
            </Link>
          </p>
          <h1>Detalle recepción · {activeHotel.hotel_name}</h1>
        </header>

        <GoodsReceiptDetail receiptId={id} />
      </div>
    </main>
  )
}
