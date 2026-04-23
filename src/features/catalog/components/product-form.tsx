'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { productInputSchema, type ProductInput } from '../domain/schemas'
import { PRODUCT_STORAGE_TYPES } from '../domain/types'
import { STORAGE_TYPE_LABELS } from '../domain/invariants'
import { useCreateProduct, useUpdateProduct } from '../application/use-products'
import { useUnits } from '../application/use-units'
import { useProductCategories } from '../application/use-product-categories'
import type { Product } from '../domain/types'
import { Button } from '@/components/ui/button'

interface Props {
  hotelId: string
  initial?: Product
  onDone?: (product: Product) => void
}

type FormShape = {
  name: string
  description?: string | null
  sku?: string | null
  category_id?: string | null
  default_unit_id?: string | null
  storage_type: (typeof PRODUCT_STORAGE_TYPES)[number]
  shelf_life_days?: number | null
  min_stock?: number | null
  max_stock?: number | null
  reorder_point?: number | null
  allergens: string[]
  is_active: boolean
}

export function ProductForm({ hotelId, initial, onDone }: Props) {
  const router = useRouter()
  const create = useCreateProduct()
  const update = useUpdateProduct()
  const { data: units = [] } = useUnits(hotelId)
  const { data: categories = [] } = useProductCategories(hotelId)
  const [zodError, setZodError] = useState<string | null>(null)

  const { register, handleSubmit, formState } = useForm<FormShape>({
    defaultValues: {
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      sku: initial?.sku ?? '',
      category_id: initial?.category_id ?? null,
      default_unit_id: initial?.default_unit_id ?? null,
      storage_type: initial?.storage_type ?? 'ambient',
      shelf_life_days: initial?.shelf_life_days ?? null,
      min_stock: initial?.min_stock ?? null,
      max_stock: initial?.max_stock ?? null,
      reorder_point: initial?.reorder_point ?? null,
      allergens: Array.isArray(initial?.allergens)
        ? (initial.allergens as string[])
        : [],
      is_active: initial?.is_active ?? true,
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setZodError(null)
    const toNumOrNull = (v: unknown): number | null => {
      if (v === null || v === undefined || v === '') return null
      const n = Number(v)
      return Number.isFinite(n) ? n : null
    }
    const toStrOrNull = (v: unknown): string | null => {
      if (v === null || v === undefined) return null
      const s = String(v).trim()
      return s.length === 0 ? null : s
    }

    const candidate: ProductInput = {
      hotel_id: hotelId,
      name: values.name.trim(),
      description: toStrOrNull(values.description),
      sku: toStrOrNull(values.sku),
      category_id: toStrOrNull(values.category_id),
      default_unit_id: toStrOrNull(values.default_unit_id),
      storage_type: values.storage_type,
      shelf_life_days: toNumOrNull(values.shelf_life_days),
      min_stock: toNumOrNull(values.min_stock),
      max_stock: toNumOrNull(values.max_stock),
      reorder_point: toNumOrNull(values.reorder_point),
      allergens: values.allergens ?? [],
      is_active: values.is_active,
    }

    const parsed = productInputSchema.safeParse(candidate)
    if (!parsed.success) {
      setZodError(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' · '))
      return
    }

    try {
      const product = initial
        ? await update.mutateAsync({ ...parsed.data, id: initial.id, hotel_id: hotelId })
        : await create.mutateAsync(parsed.data)
      if (onDone) onDone(product)
      else router.push(`/catalog/products/${product.id}`)
    } catch (e) {
      console.error(e)
    }
  })

  const isPending = formState.isSubmitting || create.isPending || update.isPending

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="kpi-label mb-1 block">Nombre *</label>
          <input
            {...register('name', { required: true })}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>

        <div>
          <label className="kpi-label mb-1 block">SKU</label>
          <input
            {...register('sku')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>

        <div>
          <label className="kpi-label mb-1 block">Categoría</label>
          <select
            {...register('category_id')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          >
            <option value="">— Sin categoría —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="kpi-label mb-1 block">Unidad base</label>
          <select
            {...register('default_unit_id')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          >
            <option value="">—</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.abbreviation})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="kpi-label mb-1 block">Conservación</label>
          <select
            {...register('storage_type')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          >
            {PRODUCT_STORAGE_TYPES.map((t) => (
              <option key={t} value={t}>
                {STORAGE_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="kpi-label mb-1 block">Caducidad (días)</label>
          <input
            type="number"
            min={1}
            {...register('shelf_life_days')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
      </div>

      <div>
        <label className="kpi-label mb-1 block">Descripción</label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full rounded border px-3 py-2 text-sm"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="kpi-label mb-1 block">Stock mínimo</label>
          <input
            type="number"
            step="any"
            {...register('min_stock')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
        <div>
          <label className="kpi-label mb-1 block">Stock máximo</label>
          <input
            type="number"
            step="any"
            {...register('max_stock')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
        <div>
          <label className="kpi-label mb-1 block">Punto reorden</label>
          <input
            type="number"
            step="any"
            {...register('reorder_point')}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          />
        </div>
      </div>

      {zodError && <p className="text-sm text-danger">{zodError}</p>}
      {(create.error || update.error) && (
        <p className="text-sm text-danger">
          {String((create.error ?? update.error)?.message)}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isPending}>
          {initial ? 'Guardar cambios' : 'Crear producto'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
