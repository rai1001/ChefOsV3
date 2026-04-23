'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ROLES, type Role } from '@/features/identity'
import { useTeamMembers } from '../application/use-team-members'
import { useUpdateMemberRole } from '../application/use-update-member-role'
import { useDeactivateMember, useReactivateMember } from '../application/use-deactivate-member'

const ROLE_LABELS: Record<Role, string> = {
  superadmin: 'Super Admin',
  direction: 'Dirección',
  admin: 'Admin',
  head_chef: 'Head Chef',
  sous_chef: 'Sous Chef',
  cook: 'Cook',
  commercial: 'Comercial',
  procurement: 'Compras',
  warehouse: 'Almacén',
  room: 'Sala',
  reception: 'Recepción',
  operations: 'Operaciones',
  maintenance: 'Mantenimiento',
}

export function TeamMembersList({ hotelId }: { hotelId: string }) {
  const { data, isLoading, error } = useTeamMembers(hotelId)
  const updateRole = useUpdateMemberRole(hotelId)
  const deactivate = useDeactivateMember(hotelId)
  const reactivate = useReactivateMember(hotelId)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftRole, setDraftRole] = useState<Role>('cook')

  if (isLoading) return <p className="kpi-label">Cargando miembros…</p>
  if (error) return <p className="text-danger">Error: {error.message}</p>
  const items = data ?? []
  if (items.length === 0) {
    return <p className="text-[color:var(--color-text-muted)]">Sin miembros todavía.</p>
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
            <th className="kpi-label px-3 py-2">Nombre</th>
            <th className="kpi-label px-3 py-2">Email</th>
            <th className="kpi-label px-3 py-2">Rol</th>
            <th className="kpi-label px-3 py-2">Estado</th>
            <th className="kpi-label px-3 py-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((m) => {
            const isEditing = editingId === m.membership_id
            return (
              <tr
                key={m.membership_id}
                className="border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <td className="px-3 py-2">{m.full_name ?? '—'}</td>
                <td className="px-3 py-2 font-code text-xs">{m.email}</td>
                <td className="px-3 py-2">
                  {isEditing ? (
                    <Select value={draftRole} onValueChange={(v) => setDraftRole(v as Role)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="kpi-label">{ROLE_LABELS[m.role]}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span className={`badge-status ${m.is_active ? 'success' : 'neutral'}`}>
                    {m.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-1">
                    {isEditing ? (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          disabled={updateRole.isPending}
                          onClick={async () => {
                            await updateRole.mutateAsync({
                              membershipId: m.membership_id,
                              role: draftRole,
                            })
                            setEditingId(null)
                          }}
                        >
                          Guardar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setEditingId(m.membership_id)
                            setDraftRole(m.role)
                          }}
                        >
                          Rol
                        </Button>
                        {m.is_active ? (
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={deactivate.isPending}
                            onClick={() => deactivate.mutate(m.membership_id)}
                          >
                            Desactivar
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={reactivate.isPending}
                            onClick={() => reactivate.mutate(m.membership_id)}
                          >
                            Reactivar
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
