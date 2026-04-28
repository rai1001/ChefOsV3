import type {
  GoodsReceiptQualityStatus,
  PurchaseOrderLine,
  PurchaseOrderStatus,
  PurchaseRequestStatus,
} from './types'

export type StatusVariant = 'neutral' | 'warning' | 'success' | 'info' | 'urgent'

export const PR_STATUS_LABELS: Record<PurchaseRequestStatus, string> = {
  draft: 'Borrador',
  approved: 'Aprobada',
  consolidated: 'Consolidada',
  cancelled: 'Cancelada',
}

export const PR_STATUS_VARIANT: Record<PurchaseRequestStatus, StatusVariant> = {
  draft: 'neutral',
  approved: 'success',
  consolidated: 'info',
  cancelled: 'urgent',
}

export const PO_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  draft: 'Borrador',
  sent: 'Enviado',
  received_partial: 'Recepcion parcial',
  received_complete: 'Recepcion completa',
  closed: 'Cerrado',
  cancelled: 'Cancelado',
}

export const PO_STATUS_VARIANT: Record<PurchaseOrderStatus, StatusVariant> = {
  draft: 'neutral',
  sent: 'info',
  received_partial: 'warning',
  received_complete: 'success',
  closed: 'success',
  cancelled: 'urgent',
}

export const GR_QUALITY_LABELS: Record<GoodsReceiptQualityStatus, string> = {
  accepted: 'Aceptada',
  partial: 'Parcial',
  rejected: 'Rechazada',
}

export const VALID_PR_TRANSITIONS: Record<
  PurchaseRequestStatus,
  readonly PurchaseRequestStatus[]
> = {
  draft: ['approved', 'cancelled'],
  approved: ['consolidated', 'cancelled'],
  consolidated: [],
  cancelled: [],
}

export const VALID_PO_TRANSITIONS: Record<
  PurchaseOrderStatus,
  readonly PurchaseOrderStatus[]
> = {
  draft: ['sent', 'cancelled'],
  sent: ['received_partial', 'received_complete', 'cancelled'],
  received_partial: ['received_complete', 'closed'],
  received_complete: ['closed'],
  closed: [],
  cancelled: [],
}

export const TERMINAL_PR_STATUSES: readonly PurchaseRequestStatus[] = [
  'consolidated',
  'cancelled',
]

export const TERMINAL_PO_STATUSES: readonly PurchaseOrderStatus[] = [
  'closed',
  'cancelled',
]

export function canTransitionPR(
  from: PurchaseRequestStatus,
  to: PurchaseRequestStatus
): boolean {
  return VALID_PR_TRANSITIONS[from].includes(to)
}

export function canTransitionPO(
  from: PurchaseOrderStatus,
  to: PurchaseOrderStatus
): boolean {
  return VALID_PO_TRANSITIONS[from].includes(to)
}

export function isTerminalPRStatus(status: PurchaseRequestStatus): boolean {
  return TERMINAL_PR_STATUSES.includes(status)
}

export function isTerminalPOStatus(status: PurchaseOrderStatus): boolean {
  return TERMINAL_PO_STATUSES.includes(status)
}

export function getPendingQuantity(
  line: Pick<PurchaseOrderLine, 'quantity_ordered' | 'quantity_received'>
): number {
  return Math.max(0, line.quantity_ordered - line.quantity_received)
}

export function validateGRLine(line: {
  quality_status: GoodsReceiptQualityStatus
  rejection_reason?: string | null
}): boolean {
  return line.quality_status !== 'rejected' || !!line.rejection_reason?.trim()
}

export function calculatePOStatusAfterReceipt(
  lines: ReadonlyArray<Pick<PurchaseOrderLine, 'quantity_ordered' | 'quantity_received'>>
): Extract<PurchaseOrderStatus, 'received_partial' | 'received_complete'> {
  const isComplete =
    lines.length > 0 &&
    lines.every((line) => line.quantity_received >= line.quantity_ordered)

  return isComplete ? 'received_complete' : 'received_partial'
}

export function groupPurchaseOrderLinesBySupplier<
  T extends { supplier_id: string | null },
>(lines: ReadonlyArray<T>): Record<string, T[]> {
  const grouped: Record<string, T[]> = Object.create(null) as Record<string, T[]>
  for (const line of lines) {
    const supplierId = line.supplier_id ?? 'unassigned'
    const bucket = grouped[supplierId] ?? (grouped[supplierId] = [])
    bucket.push(line)
  }
  return grouped
}
