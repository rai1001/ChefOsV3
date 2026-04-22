'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateClient } from '../application/use-create-client'
import { createClientSchema } from '../application/schemas'
import { VIP_LEVELS, type VipLevel } from '../domain/types'
import { VIP_LEVEL_LABELS } from '../domain/invariants'

export function ClientForm({ hotelId }: { hotelId: string }) {
  const router = useRouter()
  const create = useCreateClient(hotelId)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [vipLevel, setVipLevel] = useState<VipLevel>('standard')

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})
    setFormError(null)
    const data = new FormData(e.currentTarget)
    const raw = {
      name: data.get('name'),
      company: (data.get('company') as string) || null,
      contact_person: (data.get('contact_person') as string) || null,
      email: (data.get('email') as string) || null,
      phone: (data.get('phone') as string) || null,
      tax_id: (data.get('tax_id') as string) || null,
      vip_level: vipLevel,
      notes: (data.get('notes') as string) || null,
    }
    const parsed = createClientSchema.safeParse(raw)
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors)
      return
    }
    try {
      await create.mutateAsync(parsed.data)
      router.push('/events/clients')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error creando cliente')
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" required autoFocus />
          {fieldErrors.name && <p className="text-xs text-danger">{fieldErrors.name[0]}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="company">Empresa</Label>
          <Input id="company" name="company" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="contact_person">Persona de contacto</Label>
          <Input id="contact_person" name="contact_person" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" />
          {fieldErrors.email && <p className="text-xs text-danger">{fieldErrors.email[0]}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" name="phone" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="tax_id">CIF / NIF</Label>
          <Input id="tax_id" name="tax_id" />
        </div>

        <div className="space-y-1">
          <Label>Nivel VIP</Label>
          <Select value={vipLevel} onValueChange={(v) => setVipLevel(v as VipLevel)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VIP_LEVELS.map((v) => (
                <SelectItem key={v} value={v}>
                  {VIP_LEVEL_LABELS[v]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea id="notes" name="notes" rows={3} />
        </div>
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

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? 'Creando…' : 'Crear cliente'}
        </Button>
      </div>
    </form>
  )
}
