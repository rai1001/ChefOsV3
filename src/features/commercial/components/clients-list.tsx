'use client'

import { useClientsInfinite } from '../application/use-clients'
import { VIP_LEVEL_LABELS } from '../domain/invariants'
import { Button } from '@/components/ui/button'

export function ClientsList({ hotelId }: { hotelId: string }) {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useClientsInfinite(hotelId)

  if (isLoading) return <p className="kpi-label">Cargando clientes…</p>
  if (error) return <p className="text-danger">No se pudieron cargar los clientes.</p>
  const items = data?.pages.flatMap((p) => p.rows) ?? []
  if (items.length === 0) {
    return <p className="text-[color:var(--color-text-muted)]">No hay clientes todavía.</p>
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
              <th className="kpi-label px-3 py-2">Empresa</th>
              <th className="kpi-label px-3 py-2">Contacto</th>
              <th className="kpi-label px-3 py-2">Email</th>
              <th className="kpi-label px-3 py-2">VIP</th>
              <th className="kpi-label px-3 py-2 text-right">LTV</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr
                key={c.id}
                className="border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <td className="px-3 py-2">{c.name}</td>
                <td className="px-3 py-2 text-[color:var(--color-text-secondary)]">
                  {c.company ?? '—'}
                </td>
                <td className="px-3 py-2 text-[color:var(--color-text-secondary)]">
                  {c.contact_person ?? '—'}
                </td>
                <td className="px-3 py-2 font-code text-xs">{c.email ?? '—'}</td>
                <td className="px-3 py-2 kpi-label">{VIP_LEVEL_LABELS[c.vip_level]}</td>
                <td className="px-3 py-2 text-right font-data">
                  {c.lifetime_value.toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
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
