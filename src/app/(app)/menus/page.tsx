import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { Button } from '@/components/ui/button'
import { MenusList } from '@/features/menus/components/menus-list'

export const dynamic = 'force-dynamic'

export default async function MenusPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="kpi-label">
              <Link href="/" className="hover:underline">
                ← Dashboard
              </Link>
            </p>
            <h1>Menús · {activeHotel.hotel_name}</h1>
          </div>
          <Button asChild size="sm">
            <Link href="/menus/new">Nuevo menú</Link>
          </Button>
        </header>

        <MenusList hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}
