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

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <div className="mt-4 flex gap-2 flex-wrap">
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
            <p className="kpi-label mb-2">sprint-03 · recipes</p>
            <h2>Recetas</h2>
            <p className="mt-2 text-[color:var(--color-text-secondary)]">
              Fichas técnicas, ingredientes, pasos, escandallo live vs albarán.
            </p>
            <div className="mt-4 flex gap-2 flex-wrap">
              <Button asChild size="sm">
                <Link href="/recipes">Abrir</Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href="/menus">Menús</Link>
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
            <p className="kpi-label mb-2">sprint-02b · tenant-admin</p>
            <h2>Configuración</h2>
            <p className="mt-2 text-[color:var(--color-text-secondary)]">
              Hoteles de tu grupo, miembros, roles, invitaciones por email.
            </p>
            <div className="mt-4 flex gap-2 flex-wrap">
              <Button asChild size="sm">
                <Link href="/settings">Abrir</Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href="/settings/team">Equipo</Link>
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
            <p className="kpi-label mb-2">sprint-06 · inventory</p>
            <h2>Inventario</h2>
            <p className="mt-2 text-[color:var(--color-text-secondary)]">
              Lotes FIFO, stock disponible, movimientos y acciones manuales.
            </p>
            <div className="mt-4 flex gap-2 flex-wrap">
              <Button asChild size="sm">
                <Link href="/inventory">Abrir</Link>
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
            <p className="kpi-label mb-2">sprint-07 · production</p>
            <h2>Producción</h2>
            <p className="mt-2 text-[color:var(--color-text-secondary)]">
              Órdenes con receta escalada, viabilidad de stock y consumo FIFO.
            </p>
            <div className="mt-4 flex gap-2 flex-wrap">
              <Button asChild size="sm">
                <Link href="/production">Abrir</Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href="/production/new">Nueva orden</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
