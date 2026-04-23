import Link from 'next/link'
import { getActiveHotelOrNull, getCurrentUserOrNull } from '@/features/identity/server'
import { MenuForm } from '@/features/menus/components/menu-form'

export const dynamic = 'force-dynamic'

export default async function NewMenuPage() {
  const [user, activeHotel] = await Promise.all([getCurrentUserOrNull(), getActiveHotelOrNull()])
  if (!user || !activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/menus" className="hover:underline">
              ← Menús
            </Link>
          </p>
          <h1>Nuevo menú</h1>
        </header>

        <section
          className="rounded-lg border p-6"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          <MenuForm hotelId={activeHotel.hotel_id} userId={user.id} />
        </section>
      </div>
    </main>
  )
}
