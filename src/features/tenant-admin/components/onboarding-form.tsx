'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateTenantWithHotel } from '../application/use-create-tenant-with-hotel'
import {
  COMMON_CURRENCIES,
  COMMON_TIMEZONES,
  createTenantWithHotelSchema,
} from '../application/schemas'
import { toSlug } from './slug-utils'

export function OnboardingForm() {
  const router = useRouter()
  const create = useCreateTenantWithHotel()

  const [tenantName, setTenantName] = useState('')
  const [hotelName, setHotelName] = useState('')
  const [hotelSlug, setHotelSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [timezone, setTimezone] = useState('Europe/Madrid')
  const [currency, setCurrency] = useState('EUR')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const handleHotelNameChange = (value: string) => {
    setHotelName(value)
    if (!slugTouched) setHotelSlug(toSlug(value))
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})
    setFormError(null)

    const parsed = createTenantWithHotelSchema.safeParse({
      tenant_name: tenantName,
      hotel_name: hotelName,
      hotel_slug: hotelSlug,
      timezone,
      currency,
    })
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors)
      return
    }

    try {
      await create.mutateAsync(parsed.data)
      router.push('/')
      router.refresh()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error creando hotel')
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1">
        <Label htmlFor="tenant_name">Empresa o grupo hotelero</Label>
        <Input
          id="tenant_name"
          value={tenantName}
          onChange={(e) => setTenantName(e.target.value)}
          required
          autoFocus
          placeholder="Ej: Grupo Eurostars"
        />
        {fieldErrors.tenant_name && (
          <p className="text-xs text-danger">{fieldErrors.tenant_name[0]}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="hotel_name">Nombre del hotel</Label>
        <Input
          id="hotel_name"
          value={hotelName}
          onChange={(e) => handleHotelNameChange(e.target.value)}
          required
          placeholder="Ej: Hotel Plaza Mayor"
        />
        {fieldErrors.hotel_name && (
          <p className="text-xs text-danger">{fieldErrors.hotel_name[0]}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="hotel_slug">Slug (identificador URL)</Label>
        <Input
          id="hotel_slug"
          value={hotelSlug}
          onChange={(e) => {
            setHotelSlug(e.target.value)
            setSlugTouched(true)
          }}
          required
          placeholder="hotel-plaza-mayor"
        />
        <p className="text-xs text-[color:var(--color-text-muted)]">
          Solo minúsculas, números y guiones. Se genera automáticamente.
        </p>
        {fieldErrors.hotel_slug && (
          <p className="text-xs text-danger">{fieldErrors.hotel_slug[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <Button type="submit" size="lg" disabled={create.isPending} className="w-full">
        {create.isPending ? 'Creando…' : 'Crear hotel y entrar'}
      </Button>
    </form>
  )
}
