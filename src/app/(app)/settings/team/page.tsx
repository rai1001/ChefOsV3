import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { InviteMemberDialog } from '@/features/tenant-admin/components/invite-member-dialog'
import { InvitesList } from '@/features/tenant-admin/components/invites-list'
import { TeamMembersList } from '@/features/tenant-admin/components/team-members-list'

export const dynamic = 'force-dynamic'

export default async function TeamSettingsPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="kpi-label">
              <Link href="/settings" className="hover:underline">
                ← Configuración
              </Link>
            </p>
            <h1>Equipo · {activeHotel.hotel_name}</h1>
          </div>
          <InviteMemberDialog hotelId={activeHotel.hotel_id} />
        </header>

        <section className="space-y-3">
          <h2>Miembros</h2>
          <TeamMembersList hotelId={activeHotel.hotel_id} />
        </section>

        <section className="space-y-3">
          <h2>Invitaciones</h2>
          <InvitesList hotelId={activeHotel.hotel_id} />
        </section>
      </div>
    </main>
  )
}
