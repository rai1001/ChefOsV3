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
import { useCreateHotel } from '../application/use-create-hotel'
import { COMMON_CURRENCIES, COMMON_TIMEZONES, createHotelSchema } from '../application/schemas'
import { toSlug } from './slug-utils'

export function CreateHotelDialog({ tenantId }: { tenantId: string }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [timezone, setTimezone] = useState('Europe/Madrid')
  const [currency, setCurrency] = useState('EUR')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const create = useCreateHotel()

  const handleNameChange = (v: string) => {
    setName(v)
    if (!slugTouched) setSlug(toSlug(v))
  }

  const reset = () => {
    setName('')
    setSlug('')
    setSlugTouched(false)
    setTimezone('Europe/Madrid')
    setCurrency('EUR')
    setFieldErrors({})
    setFormError(null)
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})
    setFormError(null)
    const parsed = createHotelSchema.safeParse({
      tenant_id: tenantId,
      name,
      slug,
      timezone,
      currency,
    })
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors)
      return
    }
    try {
      await create.mutateAsync(parsed.data)
      setOpen(false)
      reset()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error creando hotel')
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
        <Button size="sm">Nuevo hotel</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir hotel</DialogTitle>
          <DialogDescription>
            El hotel se crea bajo tu grupo actual con tu rol admin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="h_name">Nombre</Label>
            <Input
              id="h_name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              autoFocus
            />
            {fieldErrors.name && <p className="text-xs text-danger">{fieldErrors.name[0]}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="h_slug">Slug</Label>
            <Input
              id="h_slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugTouched(true)
              }}
              required
            />
            {fieldErrors.slug && <p className="text-xs text-danger">{fieldErrors.slug[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Zona horaria</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Moneda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Creando…' : 'Crear hotel'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
