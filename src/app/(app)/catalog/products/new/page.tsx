import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { ProductForm } from '@/features/catalog/components/product-form'

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/catalog/products" className="hover:underline">
              ← Productos
            </Link>
          </p>
          <h1>Nuevo producto</h1>
        </header>

        <ProductForm hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}
