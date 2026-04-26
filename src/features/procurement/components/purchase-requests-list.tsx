'use client'

import { useState } from 'react'
import { Check, PackageCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useConsolidatePRs } from '../application/use-consolidate-prs'
import { usePurchaseRequests } from '../application/use-purchase-requests'
import { useTransitionPR } from '../application/use-transition-pr'
import { PR_STATUSES, type PurchaseRequestStatus } from '../domain/types'
import { PR_STATUS_LABELS } from '../domain/invariants'
import { PRStatusBadge } from './pr-status-badge'

export function PurchaseRequestsList({ hotelId }: { hotelId: string }) {
  const [status, setStatus] = useState<PurchaseRequestStatus | 'all'>('all')
  const [selected, setSelected] = useState<string[]>([])
  const transition = useTransitionPR()
  const consolidate = useConsolidatePRs()

  const { data, isLoading, error } = usePurchaseRequests({
    hotelId,
    status: status === 'all' ? undefined : status,
  })

  if (isLoading) return <p className="kpi-label">Cargando solicitudes...</p>
  if (error) return <p className="text-danger">Error: {error.message}</p>

  const rows = data?.rows ?? []
  const approvedSelected = selected.filter((id) =>
    rows.some((row) => row.id === id && row.status === 'approved')
  )

  const toggleSelected = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const approve = async (requestId: string) => {
    await transition.mutateAsync({
      hotel_id: hotelId,
      request_id: requestId,
      status: 'approved',
    })
  }

  const runConsolidation = async () => {
    if (approvedSelected.length === 0) return
    await consolidate.mutateAsync({ hotel_id: hotelId, request_ids: approvedSelected })
    setSelected([])
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={status}
          aria-label="Filtrar solicitudes por estado"
          onChange={(event) => setStatus(event.target.value as PurchaseRequestStatus | 'all')}
          className="rounded border px-3 py-2 text-sm"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
        >
          <option value="all">Todos los estados</option>
          {PR_STATUSES.map((prStatus) => (
            <option key={prStatus} value={prStatus}>
              {PR_STATUS_LABELS[prStatus]}
            </option>
          ))}
        </select>

        <Button
          size="sm"
          variant="secondary"
          disabled={approvedSelected.length === 0 || consolidate.isPending}
          onClick={runConsolidation}
        >
          <PackageCheck className="h-4 w-4" aria-hidden="true" />
          Consolidar ({approvedSelected.length})
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="text-[color:var(--color-text-muted)]">No hay solicitudes.</p>
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
                <th className="kpi-label px-3 py-2">Sel</th>
                <th className="kpi-label px-3 py-2">Necesidad</th>
                <th className="kpi-label px-3 py-2">Origen</th>
                <th className="kpi-label px-3 py-2">Estado</th>
                <th className="kpi-label px-3 py-2">Evento</th>
                <th className="kpi-label px-3 py-2 text-right">Accion</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((request) => (
                <tr
                  key={request.id}
                  className="border-t transition-colors hover:bg-[color:var(--color-bg-hover)]"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(request.id)}
                      disabled={request.status !== 'approved'}
                      onChange={() => toggleSelected(request.id)}
                      aria-label={`Seleccionar solicitud ${request.id}`}
                    />
                  </td>
                  <td className="px-3 py-2 font-data">{request.needed_date}</td>
                  <td className="px-3 py-2">{request.origin}</td>
                  <td className="px-3 py-2">
                    <PRStatusBadge status={request.status} />
                  </td>
                  <td className="px-3 py-2 font-code text-xs text-[color:var(--color-text-muted)]">
                    {request.event_id ?? '-'}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {request.status === 'draft' ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={transition.isPending}
                        onClick={() => approve(request.id)}
                      >
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Aprobar
                      </Button>
                    ) : (
                      <span className="text-[color:var(--color-text-muted)]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(transition.error || consolidate.error) && (
        <p className="text-sm text-danger">
          {String((transition.error ?? consolidate.error)?.message)}
        </p>
      )}
    </div>
  )
}
