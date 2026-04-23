'use client'

import { useUnits } from '../application/use-units'
import { UNIT_TYPE_LABELS } from '../domain/invariants'
import type { UnitType } from '../domain/types'

export function UnitsPanel({ hotelId }: { hotelId: string }) {
  const { data: units = [], isLoading, error } = useUnits(hotelId)

  if (isLoading) return <p className="kpi-label">Cargando unidades…</p>
  if (error) return <p className="text-danger">Error: {error.message}</p>
  if (units.length === 0) {
    return (
      <p className="text-[color:var(--color-text-muted)]">
        Este hotel no tiene unidades configuradas. Contacta al superadmin para inicializar el catálogo de unidades.
      </p>
    )
  }

  // Agrupar por unit_type
  const grouped = units.reduce<Record<string, typeof units>>((acc, u) => {
    const bucket = acc[u.unit_type] ?? (acc[u.unit_type] = [])
    bucket.push(u)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([type, list]) => (
        <section key={type}>
          <h3 className="kpi-label mb-2">
            {UNIT_TYPE_LABELS[type as UnitType] ?? type}
          </h3>
          <div
            className="overflow-hidden rounded border"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-card)',
            }}
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
                  <th className="kpi-label px-3 py-2">Abreviatura</th>
                  <th className="kpi-label px-3 py-2 text-right">Factor conversión</th>
                  <th className="kpi-label px-3 py-2">Base</th>
                  <th className="kpi-label px-3 py-2">Por defecto</th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <td className="px-3 py-2">{u.name}</td>
                    <td className="px-3 py-2 text-[color:var(--color-text-secondary)]">
                      {u.abbreviation}
                    </td>
                    <td className="px-3 py-2 text-right font-data">
                      {u.conversion_factor}
                    </td>
                    <td className="px-3 py-2 text-[color:var(--color-text-muted)]">
                      {u.base_unit_id ? '—' : 'sí'}
                    </td>
                    <td className="px-3 py-2 text-[color:var(--color-text-muted)]">
                      {u.is_default ? '★' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}
