import type { ProductionStatus } from '../domain/order'
import { PRODUCTION_STATUS_LABELS, PRODUCTION_STATUS_VARIANT } from '../domain/order'

export function ProductionStatusBadge({ status }: { status: ProductionStatus }) {
  return (
    <span className={`badge-status ${PRODUCTION_STATUS_VARIANT[status]}`}>
      {PRODUCTION_STATUS_LABELS[status]}
    </span>
  )
}
