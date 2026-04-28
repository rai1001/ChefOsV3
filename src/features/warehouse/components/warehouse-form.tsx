'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createWarehouseSchema } from '../domain/schemas'
import {
  WAREHOUSE_TYPE_LABELS,
  WAREHOUSE_TYPES,
  type WarehouseType,
} from '../domain/types'
import { useCreateWarehouse } from '../application/use-warehouses'

export function WarehouseForm({ hotelId }: { hotelId: string }) {
  const router = useRouter()
  const createWarehouse = useCreateWarehouse()
  const [name, setName] = useState('')
  const [warehouseType, setWarehouseType] = useState<WarehouseType>('dry')
  const [notes, setNotes] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setValidationError(null)

    const parsed = createWarehouseSchema.safeParse({
      hotel_id: hotelId,
      name,
      warehouse_type: warehouseType,
      notes,
    })

    if (!parsed.success) {
      setValidationError(
        parsed.error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(' · ')
      )
      return
    }

    const result = await createWarehouse.mutateAsync(parsed.data)
    router.push(`/warehouses/${result.warehouse_id}`)
  }

  return (
    <form
      onSubmit={submit}
      className="max-w-2xl space-y-4 rounded border p-4"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
    >
      <label className="block">
        <span className="kpi-label mb-1 block">Nombre</span>
        <Input value={name} onChange={(event) => setName(event.target.value)} />
      </label>

      <label className="block">
        <span className="kpi-label mb-1 block">Tipo</span>
        <select
          value={warehouseType}
          onChange={(event) => setWarehouseType(event.target.value as WarehouseType)}
          className="w-full rounded border px-3 py-2 text-sm"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-input)' }}
        >
          {WAREHOUSE_TYPES.map((type) => (
            <option key={type} value={type}>
              {WAREHOUSE_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="kpi-label mb-1 block">Notas</span>
        <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} />
      </label>

      {validationError || createWarehouse.error ? (
        <p className="text-sm text-danger">
          {validationError ?? createWarehouse.error?.message}
        </p>
      ) : null}

      <Button type="submit" disabled={createWarehouse.isPending}>
        <Save className="h-4 w-4" aria-hidden="true" />
        {createWarehouse.isPending ? 'Guardando' : 'Crear almacén'}
      </Button>
    </form>
  )
}
