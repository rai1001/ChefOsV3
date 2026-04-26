import { z } from 'zod'
import { GR_QUALITY_STATUSES } from './types'
import type { PurchaseOrderStatus } from './types'

const UUID_LOOSE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
const SHA256_HEX = /^[a-f0-9]{64}$/

const uuidString = () => z.string().regex(UUID_LOOSE, 'Invalid UUID')
const dateString = () => z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')

export const OCR_JOB_STATUSES = [
  'pending',
  'extracted',
  'reviewed',
  'applied',
  'rejected',
  'failed',
] as const

export const OCR_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const

export type OcrJobStatus = (typeof OCR_JOB_STATUSES)[number]
export type OcrMimeType = (typeof OCR_MIME_TYPES)[number]

const optionalText = (max = 1000) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()

export const ocrExtractedHeaderSchema = z.object({
  supplier_name: optionalText(255),
  invoice_number: optionalText(255),
  invoice_date: dateString().nullable().optional(),
  total_amount: z.number().min(0).nullable().optional(),
  currency: optionalText(12),
})

export const ocrExtractedLineSchema = z.object({
  description: z.string().trim().min(1).max(1000),
  quantity: z.number().min(0),
  unit: z.string().trim().min(1).max(64).nullable().optional(),
  unit_price: z.number().min(0),
  line_total: z.number().min(0).nullable().optional(),
  confidence: z.number().min(0).max(1).nullable().optional(),
})

export const ocrExtractedPayloadSchema = z.object({
  header: ocrExtractedHeaderSchema,
  lines: z.array(ocrExtractedLineSchema).min(1),
})

export const ocrReviewedLineSchema = z
  .object({
    purchase_order_line_id: uuidString(),
    description: z.string().trim().min(1).max(1000).nullable().optional(),
    quantity_received: z.number().min(0),
    unit_price: z.number().min(0),
    quality_status: z.enum(GR_QUALITY_STATUSES).default('accepted'),
    rejection_reason: optionalText(1000),
    lot_number: optionalText(255),
    expiry_date: dateString().nullable().optional(),
    notes: optionalText(1000),
  })
  .refine(
    (value) =>
      value.quality_status !== 'rejected' || !!value.rejection_reason?.trim(),
    {
      message: 'rejection_reason requerido si quality_status es rejected',
      path: ['rejection_reason'],
    }
  )

export const ocrReviewedPayloadSchema = z.object({
  header: ocrExtractedHeaderSchema,
  lines: z.array(ocrReviewedLineSchema).min(1),
})

export const ocrJobSchema = z.object({
  id: uuidString(),
  hotel_id: uuidString(),
  supplier_id: uuidString().nullable(),
  purchase_order_id: uuidString().nullable(),
  storage_path: z.string().trim().min(1),
  mime_type: z.enum(OCR_MIME_TYPES),
  sha256: z.string().regex(SHA256_HEX, 'Invalid SHA-256'),
  status: z.enum(OCR_JOB_STATUSES),
  extracted_payload: ocrExtractedPayloadSchema.nullable(),
  reviewed_payload: ocrReviewedPayloadSchema.nullable(),
  applied_goods_receipt_id: uuidString().nullable(),
  error_code: z.string().nullable(),
  error_message: z.string().nullable(),
  created_by: uuidString().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const createOcrJobInputSchema = z.object({
  hotel_id: uuidString(),
  storage_path: z.string().trim().min(1),
  mime_type: z.enum(OCR_MIME_TYPES),
  sha256: z.string().regex(SHA256_HEX, 'Invalid SHA-256'),
  supplier_id: uuidString().nullable().optional(),
  purchase_order_id: uuidString().nullable().optional(),
})

export type OcrExtractedHeader = z.infer<typeof ocrExtractedHeaderSchema>
export type OcrExtractedLine = z.infer<typeof ocrExtractedLineSchema>
export type OcrExtractedPayload = z.infer<typeof ocrExtractedPayloadSchema>
export type OcrReviewedLine = z.infer<typeof ocrReviewedLineSchema>
export type OcrReviewedPayload = z.infer<typeof ocrReviewedPayloadSchema>
export type OcrJob = z.infer<typeof ocrJobSchema>
export type CreateOcrJobInput = z.infer<typeof createOcrJobInputSchema>

export interface OcrJobsFilter {
  hotelId: string
  status?: OcrJobStatus | OcrJobStatus[]
  supplierId?: string
  fromDate?: string
  toDate?: string
}

export interface OcrJobListItem extends OcrJob {
  supplier_name: string | null
  purchase_order_status: PurchaseOrderStatus | null
}

export type OcrJobDetail = OcrJobListItem

export interface TriggerOcrExtractInput {
  hotel_id: string
  job_id: string
}

export interface TriggerOcrExtractResult {
  jobId: string
  status: 'extracted'
}

export interface ReviewOcrJobInput {
  hotel_id: string
  job_id: string
  reviewed_payload: OcrReviewedPayload
}

export interface ApplyOcrJobInput {
  hotel_id: string
  job_id: string
}

export interface ApplyOcrJobResult {
  goods_receipt_id: string
  lines_count: number
  new_po_status: PurchaseOrderStatus
  price_changes_logged: number
  synced_recipes: number
  idempotent: boolean
}

export interface RejectOcrJobInput {
  hotel_id: string
  job_id: string
  reason: string
}

export interface OcrReceiveGoodsLine {
  purchase_order_line_id: string
  quantity_received: number
  unit_price: number
  quality_status: OcrReviewedLine['quality_status']
  rejection_reason: string | null
  lot_number: string | null
  expiry_date: string | null
  notes: string | null
}

const OCR_EXTENSION_BY_MIME = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
} as const satisfies Record<OcrMimeType, string>

export function buildOcrStoragePath(input: {
  hotelId: string
  sha256: string
  mimeType: OcrMimeType
}): string {
  const parsed = z
    .object({
      hotelId: uuidString(),
      sha256: z.string().regex(SHA256_HEX, 'Invalid SHA-256'),
      mimeType: z.enum(OCR_MIME_TYPES),
    })
    .parse(input)

  return `${parsed.hotelId}/${parsed.sha256}.${OCR_EXTENSION_BY_MIME[parsed.mimeType]}`
}

export function mapReviewedPayloadToReceiveGoodsLines(
  payload: OcrReviewedPayload
): OcrReceiveGoodsLine[] {
  return payload.lines.map((line) => ({
    purchase_order_line_id: line.purchase_order_line_id,
    quantity_received: line.quantity_received,
    unit_price: line.unit_price,
    quality_status: line.quality_status,
    rejection_reason: line.rejection_reason?.trim() || null,
    lot_number: line.lot_number?.trim() || null,
    expiry_date: line.expiry_date ?? null,
    notes: line.notes?.trim() || null,
  }))
}
