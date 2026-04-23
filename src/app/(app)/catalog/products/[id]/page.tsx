import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Product } from '@/features/catalog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs'
import { ProductForm } from '@/features/catalog/components/product-form'
import { AliasManager } from '@/features/catalog/components/alias-manager'

export const dynamic = 'force-dynamic'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('hotel_id', activeHotel.hotel_id)
    .maybeSingle()
  if (error || !data) notFound()
  const product = data as Product

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/catalog/products" className="hover:underline">
              ← Productos
            </Link>
          </p>
          <h1>{product.name}</h1>
          <p className="text-sm text-[color:var(--color-text-muted)]">
            {product.sku ? `SKU ${product.sku} · ` : ''}
            {product.is_active ? 'Activo' : 'Archivado'}
          </p>
        </header>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList
            className="flex gap-1 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <TabsTrigger
              value="info"
              className="px-3 py-2 text-sm data-[state=active]:border-b-2 data-[state=active]:border-accent"
            >
              Información
            </TabsTrigger>
            <TabsTrigger
              value="aliases"
              className="px-3 py-2 text-sm data-[state=active]:border-b-2 data-[state=active]:border-accent"
            >
              Alias
            </TabsTrigger>
            <TabsTrigger
              value="suppliers"
              className="px-3 py-2 text-sm data-[state=active]:border-b-2 data-[state=active]:border-accent"
              disabled
            >
              Proveedores (04b)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <ProductForm hotelId={activeHotel.hotel_id} initial={product} />
          </TabsContent>
          <TabsContent value="aliases">
            <AliasManager hotelId={activeHotel.hotel_id} productId={product.id} />
          </TabsContent>
          <TabsContent value="suppliers">
            <p className="text-[color:var(--color-text-muted)]">
              Ofertas y referencias de proveedor llegan en sprint-04b.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
