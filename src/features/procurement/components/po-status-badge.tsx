'use client'

import { Badge } from '@/components/ui/badge'
import type { PurchaseOrderStatus } from '../domain/types'
import { PO_STATUS_LABELS, PO_STATUS_VARIANT } from '../domain/invariants'

export function POStatusBadge({ status }: { status: PurchaseOrderStatus }) {
  return <Badge variant={PO_STATUS_VARIANT[status]}>{PO_STATUS_LABELS[status]}</Badge>
}
