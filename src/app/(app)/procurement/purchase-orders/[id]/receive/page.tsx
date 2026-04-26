import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { ReceiveGoodsForm } from '@/features/procurement/components/receive-goods-form'

export const dynamic = 'force-dynamic'

export default async function ReceivePurchaseOrderPage({
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
            <Link href={`/procurement/purchase-orders/${id}`} className="hover:underline">
              Pedido
            </Link>
          </p>
          <h1>Recibir mercancía · {activeHotel.hotel_name}</h1>
        </header>

        <ReceiveGoodsForm hotelId={activeHotel.hotel_id} orderId={id} />
      </div>
    </main>
  )
}
