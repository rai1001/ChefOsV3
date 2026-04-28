'use client'

import { useMemo, useState } from 'react'
import {
  useResolveMappingBulk,
  useUnmappedIngredients,
} from '../application/use-resolve-mapping'
import { useMatchProductByAlias } from '../application/use-product-aliases'
import { useProducts } from '../application/use-products'
import { useUnits } from '../application/use-units'
import {
  mappingResultSummary,
  validateMappingEntries,
} from '../domain/invariants'
import type { MappingEntry, MappingResult } from '../domain/types'
import { Button } from '@/components/ui/button'

interface RowState {
  productId: string | null
  unitId: string | null
  suggestedProduct?: { id: string; name: string } | null
}

export function MappingTable({ hotelId }: { hotelId: string }) {
  const { data: unmapped = [], isLoading, error } = useUnmappedIngredients(hotelId)
  const { data: units = [], error: unitsError } = useUnits(hotelId)
  // Lista completa de productos activos del hotel — fallback por si el RPC
  // trigram no devuelve sugerencias. Paginado a 200 suficiente para MVP.
  const { data: productsPage, error: productsError } = useProducts(
    { hotelId, activeOnly: true },
    { pageSize: 200 }
  )
  const allProducts = productsPage?.rows ?? []
  const resolve = useResolveMappingBulk()

  const [draft, setDraft] = useState<Record<string, RowState>>({})
  const [result, setResult] = useState<MappingResult | null>(null)

  if (isLoading) return <p className="kpi-label">Cargando ingredientes sin mapear…</p>
  if (error) return <p className="text-danger">Error: {error.message}</p>

  if (unmapped.length === 0) {
    return (
      <p className="text-[color:var(--color-text-muted)]">
        No hay ingredientes sin mapear. 🎉
      </p>
    )
  }

  const handleApply = async () => {
    const entries: MappingEntry[] = []
    for (const row of unmapped) {
      const d = draft[row.ingredient_id]
      const productId = d?.productId ?? row.product_id
      const unitId = d?.unitId ?? row.unit_id
      // Solo enviar filas que hayan cambiado algo.
      if (
        (productId !== row.product_id || unitId !== row.unit_id) &&
        (productId !== null || unitId !== null)
      ) {
        entries.push({
          recipe_id: row.recipe_id,
          ingredient_name: row.ingredient_name,
          product_id: productId,
          unit_id: unitId,
        })
      }
    }

    const { valid, duplicates } = validateMappingEntries(entries)
    if (duplicates.length > 0) {
      alert(
        `Ingredientes duplicados dentro de la misma receta (ambigüedad): ${duplicates.join(', ')}. Resuélvelos antes de aplicar.`
      )
      return
    }
    if (valid.length === 0) {
      alert('No hay cambios para aplicar.')
      return
    }

    try {
      const res = await resolve.mutateAsync({
        hotelId,
        payload: { mappings: valid },
      })
      setResult(res)
    } catch (e) {
      console.error(e)
    }
  }

  // Errores silenciosos de productos/unidades se muestran como warning inline.
  const loadErrors = [productsError?.message, unitsError?.message].filter(Boolean)

  return (
    <div className="space-y-4">
      {loadErrors.length > 0 && (
        <div
          className="rounded border p-3 text-sm"
          style={{
            borderColor: 'var(--color-warning-fg)',
            background: 'var(--color-warning-bg)',
            color: 'var(--color-warning-fg)',
          }}
        >
          <strong>Aviso:</strong> error cargando catálogo — {loadErrors.join(' · ')}
        </div>
      )}

      <div className="flex items-center gap-3">
        <p className="text-sm text-[color:var(--color-text-muted)]">
          {unmapped.length} ingrediente{unmapped.length === 1 ? '' : 's'} sin mapear
        </p>
        <div className="ml-auto">
          <Button onClick={handleApply} disabled={resolve.isPending}>
            {resolve.isPending ? 'Aplicando…' : 'Aplicar mapping'}
          </Button>
        </div>
      </div>

      {result && (
        <div
          className="rounded border p-3 text-sm"
          style={{
            borderColor:
              result.failed_count > 0 ? 'var(--color-warning-fg)' : 'var(--color-success-fg)',
            background:
              result.failed_count > 0 ? 'var(--color-warning-bg)' : 'var(--color-success-bg)',
            color:
              result.failed_count > 0 ? 'var(--color-warning-fg)' : 'var(--color-success-fg)',
          }}
        >
          <strong>Resultado:</strong> {mappingResultSummary(result)}
          {result.failed.length > 0 && (
            <ul className="mt-2 list-disc pl-5">
              {result.failed.map((f, i) => (
                <li key={i}>
                  {f.ingredient_name} — {f.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div
        className="overflow-hidden rounded border"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              className="text-left"
              style={{
                background: 'var(--color-bg-sidebar)',
                color: 'var(--color-text-muted)',
              }}
            >
              <th className="kpi-label px-3 py-2">Receta</th>
              <th className="kpi-label px-3 py-2">Ingrediente</th>
              <th className="kpi-label px-3 py-2">Producto</th>
              <th className="kpi-label px-3 py-2">Unidad</th>
            </tr>
          </thead>
          <tbody>
            {unmapped.map((row) => {
              const d = draft[row.ingredient_id] ?? { productId: null, unitId: null }
              return (
                <MappingRow
                  key={row.ingredient_id}
                  hotelId={hotelId}
                  row={row}
                  units={units}
                  allProducts={allProducts}
                  draft={d}
                  onDraftChange={(next) =>
                    setDraft((prev) => ({ ...prev, [row.ingredient_id]: next }))
                  }
                />
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MappingRow({
  hotelId,
  row,
  units,
  allProducts,
  draft,
  onDraftChange,
}: {
  hotelId: string
  row: {
    ingredient_id: string
    recipe_id: string
    recipe_name: string
    ingredient_name: string
    product_id: string | null
    unit_id: string | null
  }
  units: Array<{ id: string; name: string; abbreviation: string }>
  allProducts: Array<{ id: string; name: string }>
  draft: RowState
  onDraftChange: (next: RowState) => void
}) {
  const query = row.ingredient_name
  const matchQuery = useMemo(() => query.trim(), [query])
  const { data: matches = [] } = useMatchProductByAlias(hotelId, matchQuery, { limit: 5 })

  const currentProductId = draft.productId ?? row.product_id
  const currentUnitId = draft.unitId ?? row.unit_id

  // Productos restantes que no están en sugerencias (para lista completa).
  const matchedIds = new Set(matches.map((m) => m.product_id))
  const remainingProducts = allProducts
    .filter((p) => !matchedIds.has(p.id))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <tr className="border-t" style={{ borderColor: 'var(--color-border)' }}>
      <td className="px-3 py-2 text-[color:var(--color-text-secondary)]">
        {row.recipe_name}
      </td>
      <td className="px-3 py-2">{row.ingredient_name}</td>
      <td className="px-3 py-2">
        <select
          value={currentProductId ?? ''}
          onChange={(e) =>
            onDraftChange({ ...draft, productId: e.target.value || null })
          }
          className="w-full rounded border px-2 py-1 text-sm"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          <option value="">— Sin mapear —</option>
          {matches.length > 0 && (
            <optgroup label="Sugerencias (match fuzzy)">
              {matches.map((m) => (
                <option key={m.product_id} value={m.product_id}>
                  {m.product_name} ({(m.similarity * 100).toFixed(0)}%)
                </option>
              ))}
            </optgroup>
          )}
          {remainingProducts.length > 0 && (
            <optgroup label="Todos los productos">
              {remainingProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </td>
      <td className="px-3 py-2">
        <select
          value={currentUnitId ?? ''}
          onChange={(e) =>
            onDraftChange({ ...draft, unitId: e.target.value || null })
          }
          className="w-full rounded border px-2 py-1 text-sm"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          <option value="">—</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.abbreviation})
            </option>
          ))}
        </select>
      </td>
    </tr>
  )
}
