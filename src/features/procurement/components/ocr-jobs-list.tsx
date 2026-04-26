'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Eye, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSuppliers } from '@/features/catalog'
import {
  OCR_JOB_STATUSES,
  type OcrJobStatus,
  useOcrJobList,
} from '@/features/procurement'
import { OcrStatusBadge } from './ocr-status-badge'

export function OcrJobsList({ hotelId }: { hotelId: string }) {
  const [status, setStatus] = useState<OcrJobStatus | 'all'>('all')
  const [supplierId, setSupplierId] = useState('')
  const suppliers = useSuppliers({ hotelId, activeOnly: true }, { pageSize: 200 })
  const filter = useMemo(
    () => ({
      hotelId,
      status: status === 'all' ? undefined : status,
      supplierId: supplierId || undefined,
    }),
    [hotelId, status, supplierId]
  )
  const { data, isLoading, error } = useOcrJobList(filter, { pageSize: 100 })

  const rows = data?.rows ?? []

  return (
    <div className="space-y-3">
      <div
        className="flex flex-wrap items-end justify-between gap-3 rounded border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <div className="grid flex-1 gap-3 md:grid-cols-2">
          <div>
            <label htmlFor="ocr-status" className="kpi-label mb-1 block">
              Estado
            </label>
            <select
              id="ocr-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as OcrJobStatus | 'all')}
              className="w-full rounded border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
            >
              <option value="all">Todos</option>
              {OCR_JOB_STATUSES.map((candidate) => (
                <option key={candidate} value={candidate}>
                  {candidate}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ocr-supplier-filter" className="kpi-label mb-1 block">
              Proveedor
            </label>
            <select
              id="ocr-supplier-filter"
              value={supplierId}
              onChange={(event) => setSupplierId(event.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
            >
              <option value="">Todos</option>
              {(suppliers.data?.rows ?? []).map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button asChild size="sm">
          <Link href="/procurement/ocr/upload">
            <Upload className="h-4 w-4" aria-hidden="true" />
            Subir
          </Link>
        </Button>
      </div>

      {isLoading ? <p className="kpi-label">Cargando OCR...</p> : null}
      {error ? <p className="text-danger">Error: {error.message}</p> : null}

      {!isLoading && rows.length === 0 ? (
        <p className="text-[color:var(--color-text-muted)]">No hay jobs OCR.</p>
      ) : null}

      {rows.length > 0 ? (
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
                <th className="kpi-label px-3 py-2">Job</th>
                <th className="kpi-label px-3 py-2">Fecha</th>
                <th className="kpi-label px-3 py-2">Proveedor</th>
                <th className="kpi-label px-3 py-2">Total</th>
                <th className="kpi-label px-3 py-2">Estado</th>
                <th className="kpi-label px-3 py-2 text-right">Accion</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((job) => (
                <tr
                  key={job.id}
                  className="border-t transition-colors hover:bg-[color:var(--color-bg-hover)]"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <td className="px-3 py-2 font-code text-xs">
                    <Link href={`/procurement/ocr/jobs/${job.id}`} className="hover:underline">
                      {job.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-3 py-2 font-data">
                    {new Date(job.created_at).toLocaleString('es-ES')}
                  </td>
                  <td className="px-3 py-2">
                    {job.supplier_name ?? job.extracted_payload?.header.supplier_name ?? '-'}
                  </td>
                  <td className="px-3 py-2 font-data">
                    {job.extracted_payload?.header.total_amount?.toFixed(2) ?? '-'}
                  </td>
                  <td className="px-3 py-2">
                    <OcrStatusBadge status={job.status} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/procurement/ocr/jobs/${job.id}`}>
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        Revisar
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
