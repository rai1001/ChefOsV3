'use client'

import { Badge } from '@/components/ui/badge'
import type { GoodsReceiptQualityStatus } from '../domain/types'
import { GR_QUALITY_LABELS } from '../domain/invariants'
import { GR_QUALITY_VARIANT } from '../domain/types'

export function GRQualityBadge({ status }: { status: GoodsReceiptQualityStatus }) {
  return <Badge variant={GR_QUALITY_VARIANT[status]}>{GR_QUALITY_LABELS[status]}</Badge>
}
