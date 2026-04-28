import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { getWarehouseServer } from '@/features/warehouse/server'
import { WarehouseDetailActions } from '@/features/warehouse/components/warehouse-detail-actions'
import { StockByWarehouseTable } from '@/features/warehouse/components/stock-by-warehouse-table'
import { WAREHOUSE_TYPE_LABELS } from '@/features/warehouse'

export const dynamic = 'force-dynamic'

export default async function WarehouseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [{ id }, activeHotel] = await Promise.all([params, getActiveHotelOrNull()])
  if (!activeHotel) return null

  const warehouse = await getWarehouseServer(activeHotel.hotel_id, id).catch(() => null)
  if (!warehouse) notFound()

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/warehouses" className="hover:underline">
              Almacenes
            </Link>
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1>{warehouse.name}</h1>
            {warehouse.is_default ? <span className="badge-status success">default</span> : null}
            {!warehouse.is_active ? <span className="badge-status neutral">archivado</span> : null}
          </div>
          <p className="mt-2 text-[color:var(--color-text-muted)]">
            {WAREHOUSE_TYPE_LABELS[warehouse.warehouse_type]} · {activeHotel.hotel_name}
          </p>
        </header>

        <WarehouseDetailActions warehouse={warehouse} />

        <section className="space-y-3">
          <h2>Stock por producto</h2>
          <StockByWarehouseTable hotelId={activeHotel.hotel_id} warehouseId={warehouse.id} />
        </section>
      </div>
    </main>
  )
}
