'use client'

import { Badge } from '@/components/ui/badge'
import type { PurchaseRequestStatus } from '../domain/types'
import { PR_STATUS_LABELS, PR_STATUS_VARIANT } from '../domain/invariants'

export function PRStatusBadge({ status }: { status: PurchaseRequestStatus }) {
  return <Badge variant={PR_STATUS_VARIANT[status]}>{PR_STATUS_LABELS[status]}</Badge>
}
