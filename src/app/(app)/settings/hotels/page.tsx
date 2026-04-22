import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { CreateHotelDialog } from '@/features/tenant-admin/components/create-hotel-dialog'
import { HotelsList } from '@/features/tenant-admin/components/hotels-list'

export const dynamic = 'force-dynamic'

export default async function HotelsSettingsPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="kpi-label">
              <Link href="/settings" className="hover:underline">
                ← Configuración
              </Link>
            </p>
            <h1>Hoteles</h1>
            <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
              Todos los hoteles de tu grupo.
            </p>
          </div>
          <CreateHotelDialog tenantId={activeHotel.tenant_id} />
        </header>

        <HotelsList tenantId={activeHotel.tenant_id} />
      </div>
    </main>
  )
}
