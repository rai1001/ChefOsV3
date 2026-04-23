import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { getMenuServer } from '@/features/menus/server'
import { MenuNotFoundError, MENU_TYPE_LABELS } from '@/features/menus'
import { MenuSectionsEditor } from '@/features/menus/components/menu-sections-editor'

export const dynamic = 'force-dynamic'

export default async function MenuDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  let menu
  try {
    menu = await getMenuServer(activeHotel.hotel_id, id)
  } catch (err) {
    if (err instanceof MenuNotFoundError) notFound()
    throw err
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/menus" className="hover:underline">
              ← Menús
            </Link>
          </p>
          <h1>{menu.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="badge-status neutral">{MENU_TYPE_LABELS[menu.menu_type]}</span>
            {menu.is_template && <span className="badge-status info">Plantilla</span>}
          </div>
        </header>

        {menu.description && (
          <p className="text-sm text-[color:var(--color-text-secondary)]">{menu.description}</p>
        )}

        <section className="space-y-3">
          <h2>Secciones</h2>
          <MenuSectionsEditor hotelId={activeHotel.hotel_id} menuId={id} />
        </section>
      </div>
    </main>
  )
}
