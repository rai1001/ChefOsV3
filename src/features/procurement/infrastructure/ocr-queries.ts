import type { SupabaseClient } from '@supabase/supabase-js'
import {
  buildPaginatedResult,
  pageRange,
  type PaginatedResult,
  type PaginationParams,
} from '@/lib/pagination'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import type { Database } from '@/types/database'
import { OcrJobNotFoundError } from '../domain/errors'
import type {
  OcrJob,
  OcrJobDetail,
  OcrJobListItem,
  OcrJobsFilter,
} from '../domain/ocr'
import type { PurchaseOrderStatus } from '../domain/types'

type Client = SupabaseClient<Database>

type OcrJobRow = OcrJob & {
  supplier?: { name: string | null } | null
  purchase_order?: { status: PurchaseOrderStatus | null } | null
}

const OCR_SELECT = `
  *,
  supplier:v3_suppliers!v3_procurement_ocr_jobs_supplier_id_fkey(name),
  purchase_order:v3_purchase_orders!v3_procurement_ocr_jobs_purchase_order_id_fkey(status)
`

export async function fetchOcrJobs(
  supabase: Client,
  filter: OcrJobsFilter,
  pagination?: PaginationParams
): Promise<PaginatedResult<OcrJobListItem>> {
  const { from, to, pageSize } = pageRange(pagination)
  let query = supabase
    .from('v3_procurement_ocr_jobs')
    .select(OCR_SELECT)
    .eq('hotel_id', filter.hotelId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filter.status) {
    query = Array.isArray(filter.status)
      ? query.in('status', filter.status)
      : query.eq('status', filter.status)
  }
  if (filter.supplierId) {
    query = query.eq('supplier_id', filter.supplierId)
  }
  if (filter.fromDate) {
    query = query.gte('created_at', filter.fromDate)
  }
  if (filter.toDate) {
    query = query.lte('created_at', filter.toDate)
  }

  const { data, error } = await query
  if (error) throw mapSupabaseError(error, { resource: 'ocr_job' })

  const rows = ((data as unknown as OcrJobRow[]) ?? []).map(toOcrJobListItem)
  return buildPaginatedResult(rows, pageSize, from)
}

export async function fetchOcrJob(
  supabase: Client,
  jobId: string
): Promise<OcrJobDetail> {
  const { data, error } = await supabase
    .from('v3_procurement_ocr_jobs')
    .select(OCR_SELECT)
    .eq('id', jobId)
    .maybeSingle()

  if (error) throw mapSupabaseError(error, { resource: 'ocr_job' })
  if (!data) throw new OcrJobNotFoundError(jobId)

  return toOcrJobListItem(data as unknown as OcrJobRow)
}

function toOcrJobListItem(row: OcrJobRow): OcrJobListItem {
  const { supplier, purchase_order, ...job } = row
  return {
    ...(job as OcrJob),
    supplier_name: supplier?.name ?? null,
    purchase_order_status: purchase_order?.status ?? null,
  }
}
