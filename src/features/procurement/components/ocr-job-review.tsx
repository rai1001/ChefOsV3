'use client'

import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  useApplyOcrJob,
  useOcrDocumentUrl,
  useOcrJobDetail,
  usePurchaseOrderLines,
  useRejectOcrJob,
  useReviewOcrJob,
} from '@/features/procurement'
import {
  ocrReviewedPayloadSchema,
  type OcrExtractedHeader,
  type OcrJobDetail,
} from '../domain/ocr'
import type { GoodsReceiptQualityStatus } from '../domain/types'
import { GR_QUALITY_STATUSES } from '../domain/types'
import { OcrStatusBadge } from './ocr-status-badge'

interface EditableLine {
  key: string
  purchase_order_line_id: string
  description: string
  quantity_received: string
  unit_price: string
  quality_status: GoodsReceiptQualityStatus
  rejection_reason: string
  lot_number: string
  expiry_date: string
  notes: string
}

const emptyHeader: OcrExtractedHeader = {
  supplier_name: null,
  invoice_number: null,
  invoice_date: null,
  total_amount: null,
  currency: null,
}

export function OcrJobReview({ hotelId, jobId }: { hotelId: string; jobId: string }) {
  const jobQuery = useOcrJobDetail(jobId)
  const job = jobQuery.data

  if (jobQuery.isLoading) return <p className="kpi-label">Cargando job OCR...</p>
  if (jobQuery.error) return <p className="text-danger">Error: {jobQuery.error.message}</p>
  if (!job) return null

  return (
    <OcrJobReviewEditor
      key={`${job.id}-${job.updated_at}`}
      hotelId={hotelId}
      jobId={jobId}
      job={job}
    />
  )
}

function OcrJobReviewEditor({
  hotelId,
  jobId,
  job,
}: {
  hotelId: string
  jobId: string
  job: OcrJobDetail
}) {
  const router = useRouter()
  const documentUrl = useOcrDocumentUrl(job.storage_path)
  const poLines = usePurchaseOrderLines(hotelId, job.purchase_order_id ?? undefined)
  const review = useReviewOcrJob()
  const apply = useApplyOcrJob()
  const reject = useRejectOcrJob()
  const [header, setHeader] = useState<OcrExtractedHeader>(() => initialHeader(job))
  const [lines, setLines] = useState<EditableLine[]>(() => initialLines(job))
  const [rejectReason, setRejectReason] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const poLineOptions = poLines.data ?? []
  const canReview = job?.status === 'extracted' || job?.status === 'reviewed'
  const canApply = job?.status === 'reviewed'
  const preview = useMemo(() => {
    if (!documentUrl.data || !job) return null
    if (job.mime_type === 'application/pdf') {
      return (
        <iframe
          title="Documento OCR"
          src={documentUrl.data}
          className="h-[70vh] w-full rounded border"
          style={{ borderColor: 'var(--color-border)' }}
        />
      )
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={documentUrl.data}
        alt="Documento OCR"
        className="max-h-[70vh] w-full rounded border object-contain"
        style={{ borderColor: 'var(--color-border)' }}
      />
    )
  }, [documentUrl.data, job])

  const updateLine = (key: string, patch: Partial<EditableLine>) => {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line))
    )
  }

  const saveReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const parsed = ocrReviewedPayloadSchema.safeParse({
      header,
      lines: lines.map((line) => ({
        purchase_order_line_id: line.purchase_order_line_id,
        description: line.description || null,
        quantity_received: Number(line.quantity_received),
        unit_price: Number(line.unit_price),
        quality_status: line.quality_status,
        rejection_reason: line.rejection_reason.trim() || null,
        lot_number: line.lot_number.trim() || null,
        expiry_date: line.expiry_date || null,
        notes: line.notes.trim() || null,
      })),
    })

    if (!parsed.success) {
      setFormError(parsed.error.issues.map((issue) => issue.message).join(' · '))
      return
    }

    await review.mutateAsync({
      hotel_id: hotelId,
      job_id: jobId,
      reviewed_payload: parsed.data,
    })
  }

  const applyJob = async () => {
    const result = await apply.mutateAsync({ hotel_id: hotelId, job_id: jobId })
    router.push(`/procurement/goods-receipts/${result.goods_receipt_id}`)
  }

  const rejectJob = async () => {
    await reject.mutateAsync({
      hotel_id: hotelId,
      job_id: jobId,
      reason: rejectReason.trim() || 'Rechazado en revision',
    })
    router.refresh()
  }

  const actionError =
    formError ??
    review.error?.message ??
    apply.error?.message ??
    reject.error?.message ??
    documentUrl.error?.message

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge-status neutral font-code">OCR {job.id.slice(0, 8)}</span>
          <OcrStatusBadge status={job.status} />
          {job.purchase_order_id ? (
            <span className="badge-status neutral font-code">
              PO {job.purchase_order_id.slice(0, 8)}
            </span>
          ) : null}
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href="/procurement/ocr/jobs">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(440px,0.9fr)]">
        <section
          className="rounded border p-3"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
        >
          {documentUrl.isLoading ? <p className="kpi-label">Cargando documento...</p> : preview}
        </section>

        <form onSubmit={saveReview} className="space-y-4">
          <section
            className="rounded border p-4"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Proveedor">
                <input
                  value={header.supplier_name ?? ''}
                  onChange={(event) =>
                    setHeader((current) => ({
                      ...current,
                      supplier_name: event.target.value || null,
                    }))
                  }
                  className="w-full rounded border px-3 py-2 text-sm"
                  style={{
                    borderColor: 'var(--color-border)',
                    background: 'var(--color-bg-card)',
                  }}
                />
              </Field>
              <Field label="Factura">
                <input
                  value={header.invoice_number ?? ''}
                  onChange={(event) =>
                    setHeader((current) => ({
                      ...current,
                      invoice_number: event.target.value || null,
                    }))
                  }
                  className="w-full rounded border px-3 py-2 text-sm"
                  style={{
                    borderColor: 'var(--color-border)',
                    background: 'var(--color-bg-card)',
                  }}
                />
              </Field>
              <Field label="Fecha">
                <input
                  type="date"
                  value={header.invoice_date ?? ''}
                  onChange={(event) =>
                    setHeader((current) => ({
                      ...current,
                      invoice_date: event.target.value || null,
                    }))
                  }
                  className="w-full rounded border px-3 py-2 text-sm"
                  style={{
                    borderColor: 'var(--color-border)',
                    background: 'var(--color-bg-card)',
                  }}
                />
              </Field>
              <Field label="Total">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={header.total_amount ?? ''}
                  onChange={(event) =>
                    setHeader((current) => ({
                      ...current,
                      total_amount: event.target.value ? Number(event.target.value) : null,
                    }))
                  }
                  className="w-full rounded border px-3 py-2 text-sm"
                  style={{
                    borderColor: 'var(--color-border)',
                    background: 'var(--color-bg-card)',
                  }}
                />
              </Field>
            </div>
          </section>

          <section className="space-y-3">
            {lines.map((line, index) => (
              <div
                key={line.key}
                className="rounded border p-4"
                style={{
                  borderColor: 'var(--color-border)',
                  background: 'var(--color-bg-card)',
                }}
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="kpi-label">Linea {index + 1}</p>
                  <span className="text-sm text-[color:var(--color-text-muted)]">
                    {line.description || '-'}
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Linea PO">
                    <select
                      value={line.purchase_order_line_id}
                      onChange={(event) =>
                        updateLine(line.key, {
                          purchase_order_line_id: event.target.value,
                        })
                      }
                      className="w-full rounded border px-3 py-2 text-sm"
                      style={{
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-bg-card)',
                      }}
                    >
                      <option value="">Seleccionar</option>
                      {poLineOptions.map((poLine) => (
                        <option key={poLine.id} value={poLine.id}>
                          {poLine.id.slice(0, 8)} · pendiente{' '}
                          {Math.max(
                            poLine.quantity_ordered - poLine.quantity_received,
                            0
                          )}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Descripcion">
                    <input
                      value={line.description}
                      onChange={(event) =>
                        updateLine(line.key, { description: event.target.value })
                      }
                      className="w-full rounded border px-3 py-2 text-sm"
                      style={{
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-bg-card)',
                      }}
                    />
                  </Field>

                  <Field label="Cantidad">
                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      value={line.quantity_received}
                      onChange={(event) =>
                        updateLine(line.key, { quantity_received: event.target.value })
                      }
                      className="w-full rounded border px-3 py-2 text-sm"
                      style={{
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-bg-card)',
                      }}
                    />
                  </Field>

                  <Field label="Precio">
                    <input
                      type="number"
                      min="0"
                      step="0.0001"
                      value={line.unit_price}
                      onChange={(event) =>
                        updateLine(line.key, { unit_price: event.target.value })
                      }
                      className="w-full rounded border px-3 py-2 text-sm"
                      style={{
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-bg-card)',
                      }}
                    />
                  </Field>

                  <Field label="Calidad">
                    <select
                      value={line.quality_status}
                      onChange={(event) =>
                        updateLine(line.key, {
                          quality_status: event.target.value as GoodsReceiptQualityStatus,
                        })
                      }
                      className="w-full rounded border px-3 py-2 text-sm"
                      style={{
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-bg-card)',
                      }}
                    >
                      {GR_QUALITY_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Lote">
                    <input
                      value={line.lot_number}
                      onChange={(event) =>
                        updateLine(line.key, { lot_number: event.target.value })
                      }
                      className="w-full rounded border px-3 py-2 text-sm"
                      style={{
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-bg-card)',
                      }}
                    />
                  </Field>

                  <Field label="Caducidad">
                    <input
                      type="date"
                      value={line.expiry_date}
                      onChange={(event) =>
                        updateLine(line.key, { expiry_date: event.target.value })
                      }
                      className="w-full rounded border px-3 py-2 text-sm"
                      style={{
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-bg-card)',
                      }}
                    />
                  </Field>

                  <Field label="Notas">
                    <input
                      value={line.notes}
                      onChange={(event) =>
                        updateLine(line.key, { notes: event.target.value })
                      }
                      className="w-full rounded border px-3 py-2 text-sm"
                      style={{
                        borderColor: 'var(--color-border)',
                        background: 'var(--color-bg-card)',
                      }}
                    />
                  </Field>
                </div>

                {line.quality_status === 'rejected' ? (
                  <div className="mt-3">
                    <Field label="Motivo rechazo">
                      <input
                        value={line.rejection_reason}
                        onChange={(event) =>
                          updateLine(line.key, {
                            rejection_reason: event.target.value,
                          })
                        }
                        className="w-full rounded border px-3 py-2 text-sm"
                        style={{
                          borderColor: 'var(--color-border)',
                          background: 'var(--color-bg-card)',
                        }}
                      />
                    </Field>
                  </div>
                ) : null}
              </div>
            ))}
          </section>

          <section
            className="rounded border p-4"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          >
            <label htmlFor="ocr-reject-reason" className="kpi-label mb-1 block">
              Motivo rechazo job
            </label>
            <input
              id="ocr-reject-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
            />
          </section>

          {actionError ? <p className="text-sm text-danger">{actionError}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={!canReview || review.isPending}>
              <Save className="h-4 w-4" aria-hidden="true" />
              {review.isPending ? 'Guardando' : 'Guardar revision'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!canApply || apply.isPending}
              onClick={applyJob}
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              {apply.isPending ? 'Aplicando' : 'Aplicar'}
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={job.status === 'applied' || reject.isPending}
              onClick={rejectJob}
            >
              <X className="h-4 w-4" aria-hidden="true" />
              {reject.isPending ? 'Rechazando' : 'Rechazar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function initialHeader(job: OcrJobDetail): OcrExtractedHeader {
  return (job.reviewed_payload ?? job.extracted_payload)?.header ?? emptyHeader
}

function initialLines(job: OcrJobDetail): EditableLine[] {
  const payload = job.reviewed_payload ?? job.extracted_payload
  return (payload?.lines ?? []).map((line, index) => ({
    key: `${index}`,
    purchase_order_line_id: 'purchase_order_line_id' in line ? line.purchase_order_line_id : '',
    description: line.description ?? '',
    quantity_received: String(
      'quantity_received' in line ? line.quantity_received : line.quantity
    ),
    unit_price: String(line.unit_price),
    quality_status: 'quality_status' in line ? line.quality_status : ('accepted' as const),
    rejection_reason: 'rejection_reason' in line ? (line.rejection_reason ?? '') : '',
    lot_number: 'lot_number' in line ? (line.lot_number ?? '') : '',
    expiry_date: 'expiry_date' in line ? (line.expiry_date ?? '') : '',
    notes: 'notes' in line ? (line.notes ?? '') : '',
  }))
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="kpi-label mb-1 block">{label}</span>
      {children}
    </label>
  )
}
