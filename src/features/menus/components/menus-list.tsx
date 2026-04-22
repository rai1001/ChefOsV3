'use client'

import Link from 'next/link'
import { useMenusInfinite } from '../application/use-menus'
import { MENU_TYPE_LABELS } from '../domain/invariants'
import { Button } from '@/components/ui/button'

export function MenusList({ hotelId }: { hotelId: string }) {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMenusInfinite(hotelId)

  if (isLoading) return <p className="kpi-label">Cargando menús…</p>
  if (error) return <p className="text-danger">Error: {error.message}</p>
  const items = data?.pages.flatMap((p) => p.rows) ?? []
  if (items.length === 0) {
    return <p className="text-[color:var(--color-text-muted)]">Sin menús todavía.</p>
  }

  return (
    <div className="space-y-3">
      <div
        className="overflow-hidden rounded border"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              className="text-left"
              style={{ background: 'var(--color-bg-sidebar)', color: 'var(--color-text-muted)' }}
            >
              <th className="kpi-label px-3 py-2">Nombre</th>
              <th className="kpi-label px-3 py-2">Tipo</th>
              <th className="kpi-label px-3 py-2 text-right">Coste total</th>
              <th className="kpi-label px-3 py-2">Plantilla</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr
                key={m.id}
                className="border-t transition-colors hover:bg-[color:var(--color-bg-hover)]"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <td className="px-3 py-2">
                  <Link href={`/menus/${m.id}`} className="underline-offset-4 hover:underline">
                    {m.name}
                  </Link>
                </td>
                <td className="px-3 py-2 text-[color:var(--color-text-secondary)]">
                  {MENU_TYPE_LABELS[m.menu_type]}
                </td>
                <td className="px-3 py-2 text-right font-data">
                  {m.total_cost.toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </td>
                <td className="px-3 py-2">
                  {m.is_template ? (
                    <span className="badge-status info">Plantilla</span>
                  ) : (
                    <span className="kpi-label">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            size="sm"
            variant="ghost"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage ? 'Cargando…' : 'Cargar más'}
          </Button>
        </div>
      )}
    </div>
  )
}
