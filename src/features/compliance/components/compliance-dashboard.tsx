'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { CheckCircle2, ClipboardCheck, Thermometer, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useComplianceOverview } from '../application/use-compliance-overview'

export function ComplianceDashboard({ hotelId }: { hotelId: string }) {
  const overview = useComplianceOverview(hotelId)
  const data = overview.data

  return (
    <div className="space-y-6">
      {overview.error ? <p className="text-danger">Error: {overview.error.message}</p> : null}
      <section className="grid gap-4 md:grid-cols-3">
        <ComplianceCard
          href="/compliance/quality"
          icon={<Truck className="h-5 w-5" aria-hidden="true" />}
          label="Recepción"
          value={data?.quality.pending_goods_receipts ?? 0}
          detail={`${data?.quality.failed_checks_30d ?? 0} incidencias 30d`}
        />
        <ComplianceCard
          href="/compliance/temperature"
          icon={<Thermometer className="h-5 w-5" aria-hidden="true" />}
          label="Temperaturas"
          value={data?.temperature.out_of_range_24h ?? 0}
          detail={`${data?.temperature.equipment_active ?? 0} equipos activos`}
        />
        <ComplianceCard
          href="/compliance/cleaning"
          icon={<ClipboardCheck className="h-5 w-5" aria-hidden="true" />}
          label="Limpieza"
          value={data?.cleaning.pending_due ?? 0}
          detail={`${data?.cleaning.completed_due ?? 0} completadas hoy`}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div
          className="rounded border p-5"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
        >
          <div className="mb-3 flex items-center gap-2 text-[color:var(--color-text-muted)]">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            <p className="kpi-label">Últimos fallos de recepción</p>
          </div>
          {data?.quality.latest_failed.length ? (
            <ul className="space-y-2 text-sm">
              {data.quality.latest_failed.map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span className="font-code text-xs">{item.goods_receipt_id.slice(0, 8)}</span>
                  <span>{new Date(item.checked_at).toLocaleString('es-ES')}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[color:var(--color-text-muted)]">Sin fallos recientes.</p>
          )}
        </div>

        <div
          className="rounded border p-5"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
        >
          <div className="mb-3 flex items-center gap-2 text-[color:var(--color-text-muted)]">
            <Thermometer className="h-5 w-5" aria-hidden="true" />
            <p className="kpi-label">Fuera de rango</p>
          </div>
          {data?.temperature.latest_out_of_range.length ? (
            <ul className="space-y-2 text-sm">
              {data.temperature.latest_out_of_range.map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span>{item.equipment_name}</span>
                  <span className="font-data">{item.temperature_c} °C</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[color:var(--color-text-muted)]">Sin alertas recientes.</p>
          )}
        </div>
      </section>
    </div>
  )
}

function ComplianceCard({
  href,
  icon,
  label,
  value,
  detail,
}: {
  href: string
  icon: ReactNode
  label: string
  value: number
  detail: string
}) {
  return (
    <div
      className="rounded border p-5"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
    >
      <div className="mb-3 flex items-center gap-2 text-[color:var(--color-text-muted)]">
        {icon}
        <p className="kpi-label">{label}</p>
      </div>
      <p className="font-data text-3xl">{value}</p>
      <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">{detail}</p>
      <Button asChild size="sm" variant="secondary" className="mt-4">
        <Link href={href}>Abrir</Link>
      </Button>
    </div>
  )
}
