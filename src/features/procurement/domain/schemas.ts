import { z } from 'zod'
import {
  GR_QUALITY_STATUSES,
  PO_STATUSES,
  PR_ORIGINS,
  PR_STATUSES,
  PROCUREMENT_DEPARTMENTS,
} from './types'

const UUID_LOOSE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

const uuidString = () => z.string().regex(UUID_LOOSE, 'Invalid UUID')

const dateString = () => z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')

export const purchaseRequestLineInputSchema = z.object({
  product_id: uuidString(),
  quantity: z.number().positive('Cantidad debe ser > 0'),
  unit_id: uuidString().nullable().optional(),
  event_id: uuidString().nullable().optional(),
  department: z.enum(PROCUREMENT_DEPARTMENTS).default('general'),
  notes: z.string().max(1000).nullable().optional(),
})

export const createPurchaseRequestInputSchema = z
  .object({
    hotel_id: uuidString(),
    origin: z.enum(PR_ORIGINS).default('manual'),
    needed_date: dateString(),
    event_id: uuidString().nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
    lines: z.array(purchaseRequestLineInputSchema).min(1),
  })
  .refine((value) => value.origin !== 'event' || !!value.event_id, {
    message: 'event_id requerido para origen event',
    path: ['event_id'],
  })

export type PurchaseRequestLineInput = z.infer<typeof purchaseRequestLineInputSchema>
export type CreatePurchaseRequestInput = z.infer<typeof createPurchaseRequestInputSchema>

export const transitionPurchaseRequestInputSchema = z.object({
  hotel_id: uuidString(),
  request_id: uuidString(),
  status: z.enum(PR_STATUSES),
  reason: z.string().max(1000).nullable().optional(),
})

export type TransitionPurchaseRequestInput = z.infer<
  typeof transitionPurchaseRequestInputSchema
>

export const consolidatePurchaseRequestsInputSchema = z.object({
  hotel_id: uuidString(),
  request_ids: z.array(uuidString()).min(1),
})

export type ConsolidatePurchaseRequestsInput = z.infer<
  typeof consolidatePurchaseRequestsInputSchema
>

export const transitionPurchaseOrderInputSchema = z.object({
  hotel_id: uuidString(),
  order_id: uuidString(),
  status: z.enum(PO_STATUSES),
  reason: z.string().max(1000).nullable().optional(),
})

export type TransitionPurchaseOrderInput = z.infer<
  typeof transitionPurchaseOrderInputSchema
>

export const receiveGoodsLineSchema = z
  .object({
    purchase_order_line_id: uuidString(),
    quantity_received: z.number().min(0, 'Cantidad recibida debe ser >= 0'),
    unit_price: z.number().min(0, 'Precio unitario debe ser >= 0'),
    quality_status: z.enum(GR_QUALITY_STATUSES).default('accepted'),
    rejection_reason: z.string().max(1000).nullable().optional(),
    lot_number: z.string().max(255).nullable().optional(),
    expiry_date: dateString().nullable().optional(),
    notes: z.string().max(1000).nullable().optional(),
  })
  .refine(
    (value) =>
      value.quality_status !== 'rejected' || !!value.rejection_reason?.trim(),
    {
      message: 'rejection_reason requerido si quality_status es rejected',
      path: ['rejection_reason'],
    }
  )

export const receiveGoodsSchema = z.object({
  hotel_id: uuidString(),
  purchase_order_id: uuidString(),
  received_at: z.string().min(1).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  lines: z.array(receiveGoodsLineSchema).min(1),
})

export type ReceiveGoodsLineInput = z.infer<typeof receiveGoodsLineSchema>
export type ReceiveGoodsInput = z.infer<typeof receiveGoodsSchema>

export const purchaseRequestsFilterSchema = z.object({
  hotelId: uuidString(),
  status: z.union([z.enum(PR_STATUSES), z.array(z.enum(PR_STATUSES))]).optional(),
  origin: z.enum(PR_ORIGINS).optional(),
  eventId: uuidString().optional(),
  fromDate: dateString().optional(),
  toDate: dateString().optional(),
})

export const purchaseOrdersFilterSchema = z.object({
  hotelId: uuidString(),
  status: z.union([z.enum(PO_STATUSES), z.array(z.enum(PO_STATUSES))]).optional(),
  supplierId: uuidString().optional(),
  fromDate: dateString().optional(),
  toDate: dateString().optional(),
})
