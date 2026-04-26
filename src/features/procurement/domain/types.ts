// Dominio procurement — sprint-05a PR/PO sobre namespace DB v3_.
// Los tipos TS mantienen nombres limpios; el prefijo vive en infrastructure.

export const PR_STATUSES = ['draft', 'approved', 'consolidated', 'cancelled'] as const
export type PurchaseRequestStatus = (typeof PR_STATUSES)[number]

export const PR_ORIGINS = ['manual', 'event', 'production'] as const
export type PurchaseRequestOrigin = (typeof PR_ORIGINS)[number]

export const PO_STATUSES = [
  'draft',
  'sent',
  'received_partial',
  'received_complete',
  'closed',
  'cancelled',
] as const
export type PurchaseOrderStatus = (typeof PO_STATUSES)[number]

export const GR_QUALITY_STATUSES = ['accepted', 'partial', 'rejected'] as const
export type GoodsReceiptQualityStatus = (typeof GR_QUALITY_STATUSES)[number]

export const GR_QUALITY_VARIANT = {
  accepted: 'neutral',
  partial: 'neutral',
  rejected: 'bronze',
} as const satisfies Record<GoodsReceiptQualityStatus, 'neutral' | 'bronze'>

export const PROCUREMENT_DEPARTMENTS = [
  'cocina_caliente',
  'cocina_fria',
  'pasteleria',
  'panaderia',
  'charcuteria',
  'pescaderia',
  'garde_manger',
  'servicio',
  'economato',
  'general',
] as const
export type ProcurementDepartment = (typeof PROCUREMENT_DEPARTMENTS)[number]

export interface PurchaseRequest {
  id: string
  hotel_id: string
  origin: PurchaseRequestOrigin
  status: PurchaseRequestStatus
  needed_date: string
  event_id: string | null
  requested_by: string
  approved_by: string | null
  approved_at: string | null
  consolidated_at: string | null
  cancel_reason: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PurchaseRequestLine {
  id: string
  hotel_id: string
  purchase_request_id: string
  product_id: string
  quantity: number
  unit_id: string | null
  event_id: string | null
  department: ProcurementDepartment
  notes: string | null
  created_at: string
}

export interface PurchaseOrder {
  id: string
  hotel_id: string
  supplier_id: string
  status: PurchaseOrderStatus
  order_date: string
  expected_delivery_date: string | null
  created_by: string
  approved_by: string | null
  sent_at: string | null
  cancel_reason: string | null
  pdf_path: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PurchaseOrderLine {
  id: string
  hotel_id: string
  purchase_order_id: string
  purchase_request_line_id: string | null
  product_id: string
  quantity_ordered: number
  quantity_received: number
  unit_id: string | null
  event_id: string | null
  department: ProcurementDepartment
  last_unit_price: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PriceChangeLog {
  id: string
  hotel_id: string
  product_id: string
  purchase_order_line_id: string | null
  old_price: number | null
  new_price: number
  source: string
  delta_pct: number | null
  detected_at: string
  created_at: string
}

export interface GoodsReceipt {
  id: string
  hotel_id: string
  purchase_order_id: string
  supplier_id: string
  received_at: string
  received_by: string
  delivery_note_image_hash: string | null
  delivery_note_image_path: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface GoodsReceiptLine {
  id: string
  hotel_id: string
  goods_receipt_id: string
  purchase_order_line_id: string
  product_id: string
  quantity_received: number
  unit_id: string | null
  unit_price: number
  quality_status: GoodsReceiptQualityStatus
  rejection_reason: string | null
  lot_number: string | null
  expiry_date: string | null
  notes: string | null
  created_at: string
}

export interface GoodsReceiptListItem extends GoodsReceipt {
  line_count: number
  supplier_name: string | null
  purchase_order_status: PurchaseOrderStatus | null
}

export interface GoodsReceiptLineDetail extends GoodsReceiptLine {
  product_name: string | null
  product_sku: string | null
  unit_name: string | null
}

export interface GoodsReceiptDetail extends GoodsReceipt {
  supplier_name: string | null
  purchase_order_status: PurchaseOrderStatus | null
  lines: GoodsReceiptLineDetail[]
}

export interface PurchaseRequestsFilter {
  hotelId: string
  status?: PurchaseRequestStatus | PurchaseRequestStatus[]
  origin?: PurchaseRequestOrigin
  eventId?: string
  fromDate?: string
  toDate?: string
}

export interface PurchaseOrdersFilter {
  hotelId: string
  status?: PurchaseOrderStatus | PurchaseOrderStatus[]
  supplierId?: string
  fromDate?: string
  toDate?: string
}

export interface GoodsReceiptsFilter {
  hotelId: string
  purchaseOrderId?: string
  supplierId?: string
  fromDate?: string
  toDate?: string
}

export interface ReceiveGoodsResult {
  goods_receipt_id: string
  lines_count: number
  new_po_status: PurchaseOrderStatus
  price_changes_logged: number
}

export interface GeneratePurchaseOrderResult {
  purchase_order_ids: string[]
  unassigned_lines: Array<{
    purchase_request_id: string
    purchase_request_line_id: string
    product_id: string
    quantity: number
  }>
  consolidated_request_ids: string[]
}

export interface GenerateEventPurchaseRequestsResult {
  purchase_request_id: string | null
  created: boolean
  lines_created: number
  skipped_unmapped_lines: number
}
