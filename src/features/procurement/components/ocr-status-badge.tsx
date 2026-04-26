'use client'

import { Badge, type BadgeVariant } from '@/components/ui/badge'
import type { OcrJobStatus } from '../domain/ocr'

const OCR_STATUS_LABELS = {
  pending: 'Pendiente',
  extracted: 'Extraido',
  reviewed: 'Revisado',
  applied: 'Aplicado',
  rejected: 'Rechazado',
  failed: 'Fallido',
} as const satisfies Record<OcrJobStatus, string>

const OCR_STATUS_VARIANT = {
  pending: 'neutral',
  extracted: 'neutral',
  reviewed: 'neutral',
  applied: 'neutral',
  rejected: 'warning',
  failed: 'urgent',
} as const satisfies Record<OcrJobStatus, BadgeVariant>

export function OcrStatusBadge({ status }: { status: OcrJobStatus }) {
  return <Badge variant={OCR_STATUS_VARIANT[status]}>{OCR_STATUS_LABELS[status]}</Badge>
}
