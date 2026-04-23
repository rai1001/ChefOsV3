'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { InvitePreview } from '../infrastructure/invite-queries'
import { acceptInviteAction } from '../application/accept-invite-action'

const ROLE_LABELS_ES: Record<string, string> = {
  superadmin: 'Super Admin',
  direction: 'Dirección',
  admin: 'Administrador',
  head_chef: 'Jefe de cocina',
  sous_chef: 'Segundo de cocina',
  cook: 'Cocinero',
  commercial: 'Comercial',
  procurement: 'Compras',
  warehouse: 'Almacén',
  room: 'Sala',
  reception: 'Recepción',
  operations: 'Operaciones',
  maintenance: 'Mantenimiento',
}

interface Props {
  token: string
  preview: InvitePreview
  callerEmail: string
}

export function AcceptInviteCard({ token, preview, callerEmail }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const expiresAt = new Date(preview.expires_at)
  const roleLabel = ROLE_LABELS_ES[preview.role] ?? preview.role
  const emailMatches = preview.email.toLowerCase() === callerEmail.toLowerCase()

  const alreadyDone = preview.status !== 'pending'

  const handleAccept = () => {
    setError(null)
    startTransition(async () => {
      try {
        await acceptInviteAction(token)
        router.push('/')
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error aceptando invitación')
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="kpi-label">Te han invitado a</p>
        <h2>{preview.hotel_name}</h2>
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          Del grupo <strong>{preview.tenant_name}</strong> como <strong>{roleLabel}</strong>.
        </p>
      </div>

      <div
        className="rounded border p-3 text-sm grid grid-cols-2 gap-2"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <div>
          <p className="kpi-label">Email invitado</p>
          <p className="font-code">{preview.email}</p>
        </div>
        <div>
          <p className="kpi-label">Tu email</p>
          <p className="font-code">{callerEmail}</p>
        </div>
        <div>
          <p className="kpi-label">Expira</p>
          <p className="font-data">{expiresAt.toLocaleDateString('es-ES')}</p>
        </div>
        <div>
          <p className="kpi-label">Estado</p>
          <p className="font-data capitalize">{preview.status}</p>
        </div>
      </div>

      {alreadyDone && (
        <div
          className="rounded border p-3 text-sm"
          style={{
            borderColor: 'var(--warning-border)',
            background: 'var(--warning-bg)',
            color: 'var(--color-warning-fg)',
          }}
        >
          Esta invitación está <strong>{preview.status}</strong>. Contacta con el admin si necesitas
          una nueva.
        </div>
      )}

      {!alreadyDone && !emailMatches && (
        <div
          className="rounded border p-3 text-sm"
          style={{
            borderColor: 'var(--urgent-border)',
            background: 'var(--urgent-bg)',
            color: 'var(--color-danger-fg)',
          }}
        >
          Esta invitación es para <strong>{preview.email}</strong>, pero estás logueado como{' '}
          <strong>{callerEmail}</strong>. Cierra sesión e inicia con el email correcto.
        </div>
      )}

      {error && (
        <div
          className="rounded border p-3 text-sm"
          style={{
            borderColor: 'var(--urgent-border)',
            background: 'var(--urgent-bg)',
            color: 'var(--color-danger-fg)',
          }}
        >
          {error}
        </div>
      )}

      {!alreadyDone && emailMatches && (
        <Button onClick={handleAccept} disabled={pending} size="lg" className="w-full">
          {pending ? 'Aceptando…' : 'Aceptar invitación y entrar'}
        </Button>
      )}
    </div>
  )
}
