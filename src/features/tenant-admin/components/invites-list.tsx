'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useInvites } from '../application/use-invites'
import { useRevokeInvite } from '../application/use-revoke-invite'
import {
  INVITE_STATUS_LABELS,
  INVITE_STATUS_VARIANT,
  canRevokeInvite,
  computeInviteStatus,
} from '../domain/invariants'

export function InvitesList({ hotelId }: { hotelId: string }) {
  const { data, isLoading, error } = useInvites(hotelId)
  const revoke = useRevokeInvite(hotelId)

  if (isLoading) return <p className="kpi-label">Cargando invitaciones…</p>
  if (error) return <p className="text-danger">Error: {error.message}</p>
  const items = data ?? []
  if (items.length === 0) {
    return <p className="text-[color:var(--color-text-muted)]">Sin invitaciones todavía.</p>
  }

  return (
    <div
      className="overflow-hidden rounded border"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr
            className="text-left"
            style={{ background: 'var(--color-bg-sidebar)', color: 'var(--color-text-muted)' }}
          >
            <th className="kpi-label px-3 py-2">Email</th>
            <th className="kpi-label px-3 py-2">Rol</th>
            <th className="kpi-label px-3 py-2">Expira</th>
            <th className="kpi-label px-3 py-2">Estado</th>
            <th className="kpi-label px-3 py-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((inv) => {
            const status = computeInviteStatus(inv)
            return (
              <tr
                key={inv.id}
                className="border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <td className="px-3 py-2 font-code text-xs">{inv.email}</td>
                <td className="px-3 py-2 kpi-label">{inv.role}</td>
                <td className="px-3 py-2 font-data text-xs">
                  {new Date(inv.expires_at).toLocaleDateString('es-ES')}
                </td>
                <td className="px-3 py-2">
                  <Badge variant={INVITE_STATUS_VARIANT[status]}>
                    {INVITE_STATUS_LABELS[status]}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-right">
                  {canRevokeInvite(inv) && (
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={revoke.isPending}
                      onClick={() => revoke.mutate(inv.id)}
                    >
                      Revocar
                    </Button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
