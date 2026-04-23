import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { SupplierForm } from '@/features/catalog/components/supplier-form'

export const dynamic = 'force-dynamic'

export default async function NewSupplierPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/catalog/suppliers" className="hover:underline">
              ← Proveedores
            </Link>
          </p>
          <h1>Nuevo proveedor</h1>
        </header>

        <SupplierForm hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}
