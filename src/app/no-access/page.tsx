import Link from 'next/link'
import { LogoutButton } from '@/components/shell/logout-button'

export default function NoAccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md space-y-4 text-center">
        <p className="kpi-label">acceso</p>
        <h1>Sin hotel asignado</h1>
        <p className="text-[color:var(--color-text-secondary)]">
          Tu cuenta está autenticada pero no tiene ningún hotel activo. Contacta al administrador
          del hotel para que te invite como miembro.
        </p>
        <div className="flex justify-center gap-2 pt-4">
          <Link
            href="mailto:soporte@chefos.app?subject=Solicitar%20acceso"
            className="rounded px-4 py-2 text-sm border"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-card)',
            }}
          >
            Contactar soporte
          </Link>
          <LogoutButton />
        </div>
      </div>
    </main>
  )
}
