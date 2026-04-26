/**
 * Contrato publico del modulo `procurement`.
 *
 * Regla: los consumidores externos importan desde `@/features/procurement`.
 * `domain/`, `application/` e `infrastructure/` son internals del modulo.
 */

export type {
  GenerateEventPurchaseRequestsResult,
  GeneratePurchaseOrderResult,
  GoodsReceipt,
  GoodsReceiptDetail,
  GoodsReceiptLine,
  GoodsReceiptLineDetail,
  GoodsReceiptListItem,
  GoodsReceiptQualityStatus,
  GoodsReceiptsFilter,
  PriceChangeLog,
  ProcurementDepartment,
  PurchaseOrder,
  PurchaseOrderLine,
  PurchaseOrderStatus,
  PurchaseOrdersFilter,
  PurchaseRequest,
  PurchaseRequestLine,
  PurchaseRequestOrigin,
  PurchaseRequestStatus,
  PurchaseRequestsFilter,
  ReceiveGoodsResult,
} from './domain/types'

export type {
  ApplyOcrJobInput,
  ApplyOcrJobResult,
  CreateOcrJobInput,
  OcrExtractedHeader,
  OcrExtractedLine,
  OcrExtractedPayload,
  OcrJob,
  OcrJobDetail,
  OcrJobListItem,
  OcrJobStatus,
  OcrJobsFilter,
  OcrMimeType,
  OcrReviewedLine,
  OcrReviewedPayload,
  RejectOcrJobInput,
  ReviewOcrJobInput,
  TriggerOcrExtractInput,
  TriggerOcrExtractResult,
} from './domain/ocr'

export {
  GR_QUALITY_STATUSES,
  GR_QUALITY_VARIANT,
  PO_STATUSES,
  PR_ORIGINS,
  PR_STATUSES,
  PROCUREMENT_DEPARTMENTS,
} from './domain/types'

export {
  OCR_JOB_STATUSES,
  OCR_MIME_TYPES,
  buildOcrStoragePath,
  createOcrJobInputSchema,
  mapReviewedPayloadToReceiveGoodsLines,
  ocrExtractedHeaderSchema,
  ocrExtractedLineSchema,
  ocrExtractedPayloadSchema,
  ocrJobSchema,
  ocrReviewedLineSchema,
  ocrReviewedPayloadSchema,
} from './domain/ocr'

export {
  GR_QUALITY_LABELS,
  PO_STATUS_LABELS,
  PO_STATUS_VARIANT,
  PR_STATUS_LABELS,
  PR_STATUS_VARIANT,
  TERMINAL_PO_STATUSES,
  TERMINAL_PR_STATUSES,
  VALID_PO_TRANSITIONS,
  VALID_PR_TRANSITIONS,
  canTransitionPO,
  canTransitionPR,
  calculatePOStatusAfterReceipt,
  getPendingQuantity,
  groupPurchaseOrderLinesBySupplier,
  isTerminalPOStatus,
  isTerminalPRStatus,
  validateGRLine,
} from './domain/invariants'

export type { StatusVariant } from './domain/invariants'

export {
  GoodsReceiptNotFoundError,
  InvalidProcurementTransitionError,
  OcrJobAlreadyAppliedError,
  OcrJobInvalidStateError,
  OcrJobNotFoundError,
  OcrRateLimitError,
  PurchaseOrderNotFoundError,
  PurchaseRequestNotFoundError,
} from './domain/errors'

export { usePurchaseRequests } from './application/use-purchase-requests'
export { usePurchaseRequest } from './application/use-purchase-request'
export { useCreatePR } from './application/use-create-pr'
export { useTransitionPR } from './application/use-transition-pr'
export { usePurchaseOrders } from './application/use-purchase-orders'
export { usePurchaseOrder } from './application/use-purchase-order'
export { usePurchaseOrderLines } from './application/use-purchase-order-lines'
export { useConsolidatePRs } from './application/use-consolidate-prs'
export { useTransitionPO } from './application/use-transition-po'
export { useGenerateEventPRs } from './application/use-generate-event-prs'
export { useGoodsReceipts } from './application/use-goods-receipts'
export { useGoodsReceipt } from './application/use-goods-receipt'
export { useReceiveGoods } from './application/use-receive-goods'
export { useCreateOcrJob } from './application/use-create-ocr-job'
export { useTriggerOcrExtract } from './application/use-trigger-ocr-extract'
export { useReviewOcrJob } from './application/use-review-ocr-job'
export { useApplyOcrJob } from './application/use-apply-ocr-job'
export { useRejectOcrJob } from './application/use-reject-ocr-job'
export { useOcrJobList } from './application/use-ocr-job-list'
export { useOcrJobDetail } from './application/use-ocr-job-detail'
export { useUploadOcrDocument } from './application/use-upload-ocr-document'
export { useOcrDocumentUrl } from './application/use-ocr-document-url'
