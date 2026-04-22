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
import { useCreateMenu } from '../application/use-menu-mutations'
import { createMenuSchema } from '../application/schemas'
import { MENU_TYPES, type MenuType } from '../domain/types'
import { MENU_TYPE_LABELS } from '../domain/invariants'

interface Props {
  hotelId: string
  userId: string
}

export function MenuForm({ hotelId, userId }: Props) {
  const router = useRouter()
  const create = useCreateMenu(hotelId, userId)
  const [menuType, setMenuType] = useState<MenuType>('seated')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})
    setFormError(null)
    const data = new FormData(e.currentTarget)
    const raw = {
      name: data.get('name'),
      menu_type: menuType,
      description: (data.get('description') as string) || null,
      target_food_cost_pct: (data.get('target_food_cost_pct') as string) || null,
      notes: (data.get('notes') as string) || null,
      is_template: data.get('is_template') === 'on',
    }
    const parsed = createMenuSchema.safeParse(raw)
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors)
      return
    }
    try {
      const menu = await create.mutateAsync(parsed.data)
      router.push(`/menus/${menu.id}`)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error creando menú')
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="m_name">Nombre del menú</Label>
          <Input id="m_name" name="name" required autoFocus />
          {fieldErrors.name && <p className="text-xs text-danger">{fieldErrors.name[0]}</p>}
        </div>

        <div className="space-y-1">
          <Label>Tipo</Label>
          <Select value={menuType} onValueChange={(v) => setMenuType(v as MenuType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MENU_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {MENU_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="m_fcp">Food cost target %</Label>
          <Input
            id="m_fcp"
            name="target_food_cost_pct"
            type="number"
            step="0.1"
            min={0}
            max={100}
            placeholder="30"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="m_desc">Descripción</Label>
          <Textarea id="m_desc" name="description" rows={2} />
        </div>

        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="m_notes">Notas internas</Label>
          <Textarea id="m_notes" name="notes" rows={2} />
        </div>

        <div className="md:col-span-2 flex items-center gap-2">
          <input type="checkbox" id="m_tpl" name="is_template" className="h-4 w-4" />
          <Label htmlFor="m_tpl" className="cursor-pointer">
            Es plantilla (reutilizable)
          </Label>
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
          {create.isPending ? 'Creando…' : 'Crear menú'}
        </Button>
      </div>
    </form>
  )
}
