import Link from 'next/link'
import { getCurrentUserOrNull, getActiveHotelOrNull } from '@/features/identity/server'
import { UserBadge } from '@/components/shell/user-badge'
import { HotelSwitcher } from '@/components/shell/hotel-switcher'
import { LogoutButton } from '@/components/shell/logout-button'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  // El layout (app) ya garantiza user + activeHotel (si null → redirect).
  // Usamos *OrNull aquí como red de seguridad para evitar errores ruidosos
  // cuando la page se ejecuta en paralelo con el layout.
  const [user, activeHotel] = await Promise.all([
    getCurrentUserOrNull(),
    getActiveHotelOrNull(),
  ])
  if (!user || !activeHotel) return null

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.email ? user.email.split('@')[0] : undefined)

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <UserBadge fullName={fullName ?? null} email={user.email ?? ''} role={activeHotel.role} />
          <div className="flex items-center gap-2">
            <HotelSwitcher />
            <LogoutButton />
          </div>
        </header>

        <section className="space-y-3">
          <p className="kpi-label">Hotel activo</p>
          <h1>{activeHotel.hotel_name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-status neutral">slug: {activeHotel.hotel_slug}</span>
            <span className="badge-status neutral">TZ: {activeHotel.timezone}</span>
            <span className="badge-status neutral">{activeHotel.currency}</span>
            <span className="badge-status info">rol: {activeHotel.role}</span>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div
            className="rounded-lg border p-6"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-card)',
            }}
          >
            <p className="kpi-label mb-2">sprint-02 · commercial</p>
            <h2>Eventos</h2>
            <p className="mt-2 text-[color:var(--color-text-secondary)]">
              Gestión de eventos, clientes, espacios, menús, BEO y calendario.
            </p>
            <div className="mt-4 flex gap-2">
              <Button asChild size="sm">
                <Link href="/events">Abrir</Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href="/events/clients">Clientes</Link>
              </Button>
            </div>
          </div>

          <div
            className="rounded-lg border p-6"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-card)',
            }}
          >
            <p className="kpi-label mb-2">sprint-01 · identity</p>
            <h2>Sesión</h2>
            <p className="mt-2 text-[color:var(--color-text-secondary)]">
              Sesión autenticada, hotel activo y switcher funcional.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
