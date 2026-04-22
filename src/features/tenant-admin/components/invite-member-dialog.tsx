'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ROLES, type Role } from '@/features/identity'
import { useCreateInvite } from '../application/use-create-invite'
import { createInviteSchema } from '../application/schemas'
import type { CreateInviteActionResult } from '../application/create-invite-action'

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

export function InviteMemberDialog({ hotelId }: { hotelId: string }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('commercial')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [result, setResult] = useState<CreateInviteActionResult | null>(null)

  const create = useCreateInvite(hotelId)

  const reset = () => {
    setEmail('')
    setRole('commercial')
    setFieldErrors({})
    setFormError(null)
    setResult(null)
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})
    setFormError(null)
    const parsed = createInviteSchema.safeParse({ hotel_id: hotelId, email, role })
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors)
      return
    }
    try {
      const r = await create.mutateAsync(parsed.data)
      setResult(r)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error creando invitación')
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">Invitar miembro</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{result ? 'Invitación enviada' : 'Invitar a tu equipo'}</DialogTitle>
          <DialogDescription>
            {result
              ? result.email_sent
                ? `Enviamos un email a ${result.email}. El link expira el ${new Date(result.expires_at).toLocaleDateString('es-ES')}.`
                : 'No hay RESEND_API_KEY configurada. Copia el link y envíalo manualmente.'
              : 'Enviaremos un email con un link de invitación que caduca en 7 días.'}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            {!result.email_sent && (
              <div
                className="rounded border p-3 text-sm"
                style={{
                  borderColor: 'var(--warning-border)',
                  background: 'var(--warning-bg)',
                  color: 'var(--color-warning-fg)',
                }}
              >
                <p className="font-medium mb-2">Link de invitación (copia y pega):</p>
                <p className="font-code text-xs break-all select-all">{result.invite_url}</p>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Cerrar</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="inv_email">Email del invitado</Label>
              <Input
                id="inv_email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="nombre@empresa.com"
              />
              {fieldErrors.email && <p className="text-xs text-danger">{fieldErrors.email[0]}</p>}
            </div>

            <div className="space-y-1">
              <Label>Rol</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger>
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
            </div>

            {formError && (
              <div
                className="rounded border p-3 text-sm"
                style={{
                  borderColor: 'var(--urgent-border)',
                  background: 'var(--urgent-bg)',
                  color: 'var(--color-danger-fg)',
                }}
              >
                {formError}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Enviando…' : 'Enviar invitación'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
