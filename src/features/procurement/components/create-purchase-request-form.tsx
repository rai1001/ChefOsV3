'use client'

import { useId, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProducts, useUnits } from '@/features/catalog'
import {
  createPurchaseRequestInputSchema,
  type CreatePurchaseRequestInput,
} from '../domain/schemas'
import { PROCUREMENT_DEPARTMENTS, type ProcurementDepartment } from '../domain/types'
import { useCreatePR } from '../application/use-create-pr'

interface FormShape {
  needed_date: string
  product_id: string
  quantity: number
  unit_id: string
  department: ProcurementDepartment
  notes: string
}

export function CreatePurchaseRequestForm({ hotelId }: { hotelId: string }) {
  const formId = useId()
  const create = useCreatePR()
  const products = useProducts({ hotelId, activeOnly: true }, { pageSize: 200 })
  const units = useUnits(hotelId)
  const [zodError, setZodError] = useState<string | null>(null)

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const { register, handleSubmit, reset, formState } = useForm<FormShape>({
    defaultValues: {
      needed_date: today,
      product_id: '',
      quantity: 1,
      unit_id: '',
      department: 'general',
      notes: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setZodError(null)
    const candidate: CreatePurchaseRequestInput = {
      hotel_id: hotelId,
      origin: 'manual',
      needed_date: values.needed_date,
      notes: values.notes.trim() || null,
      lines: [
        {
          product_id: values.product_id,
          quantity: Number(values.quantity),
          unit_id: values.unit_id || null,
          department: values.department,
        },
      ],
    }

    const parsed = createPurchaseRequestInputSchema.safeParse(candidate)
    if (!parsed.success) {
      setZodError(parsed.error.issues.map((issue) => issue.message).join(' · '))
      return
    }

    await create.mutateAsync(parsed.data)
    reset({
      needed_date: today,
      product_id: '',
      quantity: 1,
      unit_id: '',
      department: 'general',
      notes: '',
    })
  })

  const productRows = products.data?.rows ?? []
  const unitRows = units.data ?? []
  const isPending = formState.isSubmitting || create.isPending

  return (
    <form
      onSubmit={onSubmit}
      className="rounded border p-4"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="kpi-label">Nueva solicitud</p>
          <h2 className="text-base font-semibold">Compra manual</h2>
        </div>
        <Button type="submit" size="sm" disabled={isPending || productRows.length === 0}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {isPending ? 'Creando' : 'Crear'}
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <div>
          <label htmlFor={`${formId}-needed-date`} className="kpi-label mb-1 block">
            Fecha necesidad
          </label>
          <input
            id={`${formId}-needed-date`}
            type="date"
            {...register('needed_date', { required: true })}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor={`${formId}-product`} className="kpi-label mb-1 block">
            Producto
          </label>
          <select
            id={`${formId}-product`}
            {...register('product_id', { required: true })}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
            disabled={products.isLoading}
          >
            <option value="">Seleccionar</option>
            {productRows.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${formId}-quantity`} className="kpi-label mb-1 block">
            Cantidad
          </label>
          <input
            id={`${formId}-quantity`}
            type="number"
            step="0.001"
            min="0.001"
            {...register('quantity', { valueAsNumber: true, required: true })}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-unit`} className="kpi-label mb-1 block">
            Unidad
          </label>
          <select
            id={`${formId}-unit`}
            {...register('unit_id')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
            disabled={units.isLoading}
          >
            <option value="">Por defecto</option>
            {unitRows.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.abbreviation}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div>
          <label htmlFor={`${formId}-department`} className="kpi-label mb-1 block">
            Departamento
          </label>
          <select
            id={`${formId}-department`}
            {...register('department')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          >
            {PROCUREMENT_DEPARTMENTS.map((department) => (
              <option key={department} value={department}>
                {department.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor={`${formId}-notes`} className="kpi-label mb-1 block">
            Notas
          </label>
          <input
            id={`${formId}-notes`}
            {...register('notes')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
      </div>

      {productRows.length === 0 && !products.isLoading && (
        <p className="mt-3 text-sm text-[color:var(--color-text-muted)]">
          No hay productos activos en catalogo.
        </p>
      )}
      {(zodError || create.error) && (
        <p className="mt-3 text-sm text-danger">
          {zodError ?? String(create.error?.message)}
        </p>
      )}
    </form>
  )
}
