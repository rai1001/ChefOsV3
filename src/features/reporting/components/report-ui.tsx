'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { Download, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  REPORT_DATE_PRESETS,
  resolveReportDatePreset,
  type ReportDatePreset,
  type ReportDateRange,
} from '../domain/filters'

export const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
})

export const numberFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 4,
})

export const percentFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 2,
})

const presetLabels: Record<ReportDatePreset, string> = {
  last_7_days: '7 días',
  current_month: 'Mes actual',
}

export function ReportHeader({
  title,
  hotelName,
  children,
}: {
  title: string
  hotelName: string
  children?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="kpi-label">
          <Link href="/reports" className="hover:underline">
            Informes
          </Link>
        </p>
        <h1>{title} · {hotelName}</h1>
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </header>
  )
}

export function MetricCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div
      className="rounded border p-4"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
    >
      <p className="kpi-label">{label}</p>
      <p className="mt-1 font-data text-xl">{value}</p>
    </div>
  )
}

export function ReportDateFilters({ range }: { range: ReportDateRange }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setRange(nextRange: ReportDateRange) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('from', nextRange.from)
    params.set('to', nextRange.to)
    router.push(`${pathname}?${params.toString()}`)
  }

  function setField(field: keyof ReportDateRange, value: string) {
    setRange({ ...range, [field]: value })
  }

  return (
    <div
      className="flex flex-wrap items-end gap-3 rounded border p-4"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
    >
      <label>
        <span className="kpi-label mb-1 block">Desde</span>
        <input
          type="date"
          value={range.from}
          onChange={(event) => setField('from', event.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-input)' }}
        />
      </label>
      <label>
        <span className="kpi-label mb-1 block">Hasta</span>
        <input
          type="date"
          value={range.to}
          onChange={(event) => setField('to', event.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-input)' }}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {REPORT_DATE_PRESETS.map((preset) => (
          <Button
            key={preset}
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setRange(resolveReportDatePreset(preset))}
          >
            {presetLabels[preset]}
          </Button>
        ))}
      </div>
    </div>
  )
}

export function ReportToolbar({
  exportHref,
  onRefresh,
  isRefreshing,
}: {
  exportHref?: string
  onRefresh: () => void
  isRefreshing?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="secondary" onClick={onRefresh} disabled={isRefreshing}>
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Refrescar
      </Button>
      {exportHref ? (
        <Button asChild variant="secondary">
          <a href={exportHref}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Exportar CSV
          </a>
        </Button>
      ) : null}
    </div>
  )
}

export function UrlSelectFilter({
  label,
  param,
  value,
  options,
}: {
  label: string
  param: string
  value: string
  options: { value: string; label: string }[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function update(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (nextValue) {
      params.set(param, nextValue)
    } else {
      params.delete(param)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <label>
      <span className="kpi-label mb-1 block">{label}</span>
      <select
        value={value}
        onChange={(event) => update(event.target.value)}
        className="w-full rounded border px-3 py-2 text-sm"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-input)' }}
      >
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function QueryState({
  isLoading,
  error,
  empty,
}: {
  isLoading: boolean
  error: Error | null
  empty: boolean
}) {
  if (isLoading) return <p className="kpi-label">Cargando informe...</p>
  if (error) return <p className="text-danger">Error: {error.message}</p>
  if (empty) {
    return (
      <div
        className="rounded border p-6"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <h2>Sin datos</h2>
      </div>
    )
  }
  return null
}

export function TableFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded border"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}

export function BarsChart({
  rows,
  label,
}: {
  rows: { name: string; value: number }[]
  label: string
}) {
  const visibleRows = rows.slice(0, 10)
  const max = Math.max(...visibleRows.map((row) => row.value), 0)
  const height = Math.max(visibleRows.length * 30, 160)

  return (
    <div
      className="rounded border p-4"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
    >
      <p className="kpi-label mb-3">{label}</p>
      <svg viewBox={`0 0 680 ${height}`} className="h-64 w-full" role="img" aria-label={label}>
        {visibleRows.map((row, index) => {
          const width = max === 0 ? 0 : (row.value / max) * 430
          const y = index * 30 + 8
          return (
            <g key={`${row.name}-${index}`}>
              <text x="0" y={y + 14} className="fill-[color:var(--color-text-primary)] text-[11px]">
                {row.name.slice(0, 32)}
              </text>
              <rect x="230" y={y} width={width} height="16" className="fill-[color:var(--color-accent)]" />
              <text x={240 + width} y={y + 13} className="fill-[color:var(--color-text-muted)] text-[11px]">
                {numberFormatter.format(row.value)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function LineChart({
  values,
  label,
}: {
  values: { label: string; value: number | null }[]
  label: string
}) {
  const points = values
    .map((item, index) => ({ ...item, index }))
    .filter((item): item is { label: string; value: number; index: number } => item.value !== null)

  const width = 680
  const height = 220
  const min = Math.min(...points.map((point) => point.value), 0)
  const max = Math.max(...points.map((point) => point.value), 0)
  const span = max - min || 1
  const step = points.length > 1 ? width / (points.length - 1) : width
  const path = points
    .map((point, index) => {
      const x = index * step
      const y = height - ((point.value - min) / span) * (height - 32) - 16
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')

  return (
    <div
      className="rounded border p-4"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
    >
      <p className="kpi-label mb-3">{label}</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full" role="img" aria-label={label}>
        <line x1="0" x2={width} y1={height - 16} y2={height - 16} className="stroke-[color:var(--color-border)]" />
        {path ? <path d={path} fill="none" stroke="var(--color-accent)" strokeWidth="3" /> : null}
        {points.map((point, index) => {
          const x = index * step
          const y = height - ((point.value - min) / span) * (height - 32) - 16
          return (
            <circle
              key={`${point.label}-${index}`}
              cx={x}
              cy={y}
              r="4"
              className="fill-[color:var(--color-accent)]"
            />
          )
        })}
      </svg>
    </div>
  )
}
