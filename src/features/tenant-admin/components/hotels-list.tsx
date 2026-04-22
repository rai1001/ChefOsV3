'use client'

import { useTenantHotels } from '../application/use-tenant-hotels'

export function HotelsList({ tenantId }: { tenantId: string }) {
  const { data, isLoading, error } = useTenantHotels(tenantId)

  if (isLoading) return <p className="kpi-label">Cargando hoteles…</p>
  if (error) return <p className="text-danger">Error: {error.message}</p>
  const items = data ?? []
  if (items.length === 0) {
    return <p className="text-[color:var(--color-text-muted)]">No hay hoteles todavía.</p>
  }

  return (
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
            <th className="kpi-label px-3 py-2">Slug</th>
            <th className="kpi-label px-3 py-2">TZ</th>
            <th className="kpi-label px-3 py-2">Moneda</th>
            <th className="kpi-label px-3 py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {items.map((h) => (
            <tr key={h.id} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
              <td className="px-3 py-2">{h.name}</td>
              <td className="px-3 py-2 font-code text-xs">{h.slug}</td>
              <td className="px-3 py-2 font-data">{h.timezone}</td>
              <td className="px-3 py-2 font-data">{h.currency}</td>
              <td className="px-3 py-2">
                <span className={`badge-status ${h.is_active ? 'success' : 'neutral'}`}>
                  {h.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
