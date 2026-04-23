import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Supplier } from '@/features/catalog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs'
import { SupplierForm } from '@/features/catalog/components/supplier-form'
import { SupplierConfigForm } from '@/features/catalog/components/supplier-config-form'
import { OffersTable } from '@/features/catalog/components/offers-table'

export const dynamic = 'force-dynamic'

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .eq('hotel_id', activeHotel.hotel_id)
    .maybeSingle()
  if (error || !data) notFound()
  const supplier = data as Supplier

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/catalog/suppliers" className="hover:underline">
              ← Proveedores
            </Link>
          </p>
          <h1>{supplier.name}</h1>
          <p className="text-sm text-[color:var(--color-text-muted)]">
            {supplier.tax_id ? `NIF ${supplier.tax_id} · ` : ''}
            {supplier.is_active ? 'Activo' : 'Archivado'}
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
              Datos
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="px-3 py-2 text-sm data-[state=active]:border-b-2 data-[state=active]:border-accent"
            >
              Config operativa
            </TabsTrigger>
            <TabsTrigger
              value="offers"
              className="px-3 py-2 text-sm data-[state=active]:border-b-2 data-[state=active]:border-accent"
            >
              Ofertas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <SupplierForm hotelId={activeHotel.hotel_id} initial={supplier} />
          </TabsContent>
          <TabsContent value="config">
            <SupplierConfigForm
              hotelId={activeHotel.hotel_id}
              supplierId={supplier.id}
            />
          </TabsContent>
          <TabsContent value="offers">
            <OffersTable
              hotelId={activeHotel.hotel_id}
              supplierId={supplier.id}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
