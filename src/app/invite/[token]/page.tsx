import { redirect } from 'next/navigation'
import { getCurrentUserOrNull } from '@/features/identity/server'
import { previewInviteServer } from '@/features/tenant-admin/server'
import { AcceptInviteCard } from '@/features/tenant-admin/components/accept-invite-card'

export const dynamic = 'force-dynamic'

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token: rawToken } = await params
  const token = decodeURIComponent(rawToken)

  const user = await getCurrentUserOrNull()
  if (!user) {
    // Guardamos el token en la URL para volver tras el login.
    redirect(`/login?next=${encodeURIComponent(`/invite/${rawToken}`)}`)
  }

  let preview
  let loadError: string | null = null
  try {
    preview = await previewInviteServer(token)
  } catch (err) {
    loadError = err instanceof Error ? err.message : 'Error al leer la invitación'
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-6">
        <header className="text-center space-y-1">
          <p className="kpi-label">Invitación ChefOS</p>
        </header>

        <section
          className="rounded-lg border p-6"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          {loadError || !preview ? (
            <div className="space-y-3">
              <h2>Invitación no válida</h2>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                {loadError ?? 'No pudimos leer la invitación. Contacta con el admin que te la envió.'}
              </p>
            </div>
          ) : (
            <AcceptInviteCard
              token={token}
              preview={preview}
              callerEmail={user.email ?? ''}
            />
          )}
        </section>
      </div>
    </main>
  )
}
