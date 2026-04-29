import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { NotificationPreferencesForm } from '@/features/notifications/components/notification-preferences-form'

export const dynamic = 'force-dynamic'

export default async function NotificationPreferencesPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/settings" className="hover:underline">
              ← Configuración
            </Link>
          </p>
          <h1>Preferencias de notificaciones</h1>
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            Controla qué categorías de notificaciones in-app quieres recibir en{' '}
            {activeHotel.hotel_name}. Cambios solo afectan a tu cuenta.
          </p>
        </header>

        <NotificationPreferencesForm hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}
