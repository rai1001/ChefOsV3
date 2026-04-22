import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/" className="hover:underline">
              ← Dashboard
            </Link>
          </p>
          <h1>Configuración</h1>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <Link
            href="/settings/hotels"
            className="block rounded-lg border p-6 transition-colors hover:bg-[color:var(--color-bg-hover)]"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-card)',
            }}
          >
            <p className="kpi-label mb-2">tenant-admin</p>
            <h2>Hoteles</h2>
            <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
              Gestiona los hoteles de {activeHotel.hotel_name} y añade nuevos bajo el
              mismo grupo.
            </p>
          </Link>

          <Link
            href="/settings/team"
            className="block rounded-lg border p-6 transition-colors hover:bg-[color:var(--color-bg-hover)]"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-card)',
            }}
          >
            <p className="kpi-label mb-2">tenant-admin</p>
            <h2>Equipo</h2>
            <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
              Miembros del hotel, roles, invitaciones por email.
            </p>
          </Link>
        </section>
      </div>
    </main>
  )
}
