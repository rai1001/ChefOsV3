import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { PurchaseOrderDetail } from '@/features/procurement/components/purchase-order-detail'

export const dynamic = 'force-dynamic'

export default async function PurchaseOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ goods_receipt_id?: string }>
}) {
  const [{ id }, query, activeHotel] = await Promise.all([
    params,
    searchParams,
    getActiveHotelOrNull(),
  ])
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/procurement/purchase-orders" className="hover:underline">
              Pedidos
            </Link>
          </p>
          <h1>Detalle pedido · {activeHotel.hotel_name}</h1>
        </header>

        <PurchaseOrderDetail
          hotelId={activeHotel.hotel_id}
          orderId={id}
          createdReceiptId={query.goods_receipt_id}
        />
      </div>
    </main>
  )
}
