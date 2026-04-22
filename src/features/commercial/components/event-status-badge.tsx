'use client'

import { Badge } from '@/components/ui/badge'
import { EVENT_STATUS_LABELS, EVENT_STATUS_VARIANT } from '../domain/invariants'
import type { EventStatus } from '../domain/types'

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return <Badge variant={EVENT_STATUS_VARIANT[status]}>{EVENT_STATUS_LABELS[status]}</Badge>
}
