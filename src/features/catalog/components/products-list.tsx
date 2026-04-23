'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  useArchiveProduct,
  useProducts,
  useRestoreProduct,
} from '../application/use-products'
import { STORAGE_TYPE_LABELS } from '../domain/invariants'
import { Button } from '@/components/ui/button'

export function ProductsList({ hotelId }: { hotelId: string }) {
  const [search, setSearch] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const archive = useArchiveProduct()
  const restore = useRestoreProduct()

  const { data, isLoading, error } = useProducts({
    hotelId,
    search: search.trim() || undefined,
    activeOnly: !showArchived,
  })

  if (error) return <p className="text-danger">Error: {error.message}</p>

  const rows = data?.rows ?? []

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Buscar por nombre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          Incluir archivados
        </label>
        <div className="ml-auto">
          <Button asChild size="sm">
            <Link href="/catalog/products/new">Nuevo producto</Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="kpi-label">Cargando productos…</p>
      ) : rows.length === 0 ? (
        <p className="text-[color:var(--color-text-muted)]">No hay productos.</p>
      ) : (
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
                <th className="kpi-label px-3 py-2">Nombre</th>
                <th className="kpi-label px-3 py-2">SKU</th>
                <th className="kpi-label px-3 py-2">Conservación</th>
                <th className="kpi-label px-3 py-2 text-right">Caducidad (días)</th>
                <th className="kpi-label px-3 py-2">Estado</th>
                <th className="kpi-label px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr
                  key={p.id}
                  className="border-t transition-colors hover:bg-[color:var(--color-bg-hover)]"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <td className="px-3 py-2">
                    <Link
                      href={`/catalog/products/${p.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-[color:var(--color-text-secondary)]">
                    {p.sku ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-[color:var(--color-text-secondary)]">
                    {STORAGE_TYPE_LABELS[p.storage_type]}
                  </td>
                  <td className="px-3 py-2 text-right font-data">
                    {p.shelf_life_days ?? '—'}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${
                        p.is_active
                          ? 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success-fg)]'
                          : 'bg-[color:var(--color-bg-sidebar)] text-[color:var(--color-text-muted)]'
                      }`}
                    >
                      {p.is_active ? 'Activo' : 'Archivado'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {p.is_active ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          archive.mutate({ hotelId, productId: p.id })
                        }
                        disabled={archive.isPending}
                      >
                        Archivar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          restore.mutate({ hotelId, productId: p.id })
                        }
                        disabled={restore.isPending}
                      >
                        Restaurar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
