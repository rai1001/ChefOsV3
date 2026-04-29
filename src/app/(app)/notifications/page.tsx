import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { NotificationList } from '@/features/notifications/components/notification-list'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ unread?: string }>
}

export default async function NotificationsPage({ searchParams }: PageProps) {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  const params = await searchParams
  const initialUnreadOnly = params?.unread === 'true' || params?.unread === '1'

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/" className="hover:underline">
              ← Dashboard
            </Link>
          </p>
          <h1>Notificaciones</h1>
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            Avisos in-app generados por eventos operativos del hotel{' '}
            {activeHotel.hotel_name}.
          </p>
        </header>

        <NotificationList hotelId={activeHotel.hotel_id} initialUnreadOnly={initialUnreadOnly} />
      </div>
    </main>
  )
}
