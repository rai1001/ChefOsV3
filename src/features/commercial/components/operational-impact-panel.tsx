'use client'

import type { BeoImpactByDept } from '../domain/types'

const DEPT_LABELS: Record<string, string> = {
  cocina_caliente: 'Cocina caliente',
  cocina_fria: 'Cocina fría',
  pasteleria: 'Pastelería',
  panaderia: 'Panadería',
  bebidas: 'Bebidas',
  general: 'General',
}

export function OperationalImpactPanel({ items }: { items: BeoImpactByDept[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-[color:var(--color-text-muted)]">
        Sin impacto operacional calculado. Pulsa &quot;Generar impacto&quot; tras asignar menús.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((dept) => (
        <div
          key={dept.department}
          className="rounded border p-3"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
        >
          <h3 className="mb-2 kpi-label">
            {DEPT_LABELS[dept.department] ?? dept.department}
          </h3>
          <ul className="space-y-1 text-sm">
            {dept.items.map((it, idx) => (
              <li key={`${it.product_id ?? it.product_name}-${idx}`} className="flex justify-between gap-2">
                <span>{it.product_name}</span>
                <span className="font-data text-[color:var(--color-text-secondary)]">
                  {it.quantity_needed} {it.unit ?? ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
