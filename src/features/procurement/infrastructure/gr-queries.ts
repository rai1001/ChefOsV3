import type { SupabaseClient } from '@supabase/supabase-js'
import {
  buildPaginatedResult,
  pageRange,
  type PaginatedResult,
  type PaginationParams,
} from '@/lib/pagination'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import { GoodsReceiptNotFoundError } from '../domain/errors'
import type {
  GoodsReceipt,
  GoodsReceiptDetail,
  GoodsReceiptLineDetail,
  GoodsReceiptListItem,
  GoodsReceiptQualityStatus,
  GoodsReceiptsFilter,
  PurchaseOrderStatus,
} from '../domain/types'

type GoodsReceiptListRow = GoodsReceipt & {
  supplier?: { name: string | null } | null
  purchase_order?: { status: PurchaseOrderStatus | null } | null
  lines?: Array<{ id: string; quality_status: GoodsReceiptQualityStatus }> | null
}

type GoodsReceiptDetailRow = GoodsReceipt & {
  supplier?: { name: string | null } | null
  purchase_order?: { status: PurchaseOrderStatus | null } | null
  lines?: Array<
    GoodsReceiptLineDetail & {
      product?: { name: string | null; sku: string | null } | null
      unit?: { name: string | null; abbreviation: string | null } | null
    }
  > | null
}

export async function fetchGoodsReceipts(
  supabase: SupabaseClient,
  filter: GoodsReceiptsFilter,
  pagination?: PaginationParams
): Promise<PaginatedResult<GoodsReceiptListItem>> {
  const { from, to, pageSize } = pageRange(pagination)
  let query = supabase
    .from('v3_goods_receipts')
    .select(
      `
        *,
        supplier:v3_suppliers!v3_goods_receipts_supplier_id_fkey(name),
        purchase_order:v3_purchase_orders!v3_goods_receipts_purchase_order_id_fkey(status),
        lines:v3_goods_receipt_lines!v3_goods_receipt_lines_goods_receipt_id_fkey(id, quality_status)
      `
    )
    .eq('hotel_id', filter.hotelId)
    .order('received_at', { ascending: false })
    .range(from, to)

  if (filter.purchaseOrderId) {
    query = query.eq('purchase_order_id', filter.purchaseOrderId)
  }
  if (filter.supplierId) {
    query = query.eq('supplier_id', filter.supplierId)
  }
  if (filter.fromDate) {
    query = query.gte('received_at', filter.fromDate)
  }
  if (filter.toDate) {
    query = query.lte('received_at', filter.toDate)
  }

  const { data, error } = await query
  if (error) throw mapSupabaseError(error, { resource: 'goods_receipt' })

  const rows = ((data as GoodsReceiptListRow[]) ?? []).map(toGoodsReceiptListItem)
  return buildPaginatedResult(rows, pageSize, from)
}

export async function fetchGoodsReceipt(
  supabase: SupabaseClient,
  receiptId: string
): Promise<GoodsReceiptDetail> {
  const { data, error } = await supabase
    .from('v3_goods_receipts')
    .select(
      `
        *,
        supplier:v3_suppliers!v3_goods_receipts_supplier_id_fkey(name),
        purchase_order:v3_purchase_orders!v3_goods_receipts_purchase_order_id_fkey(status),
        lines:v3_goods_receipt_lines!v3_goods_receipt_lines_goods_receipt_id_fkey(
          *,
          product:v3_products!v3_goods_receipt_lines_product_id_fkey(name, sku),
          unit:v3_units_of_measure!v3_goods_receipt_lines_unit_id_fkey(name, abbreviation)
        )
      `
    )
    .eq('id', receiptId)
    .maybeSingle()

  if (error) throw mapSupabaseError(error, { resource: 'goods_receipt' })
  if (!data) throw new GoodsReceiptNotFoundError(receiptId)
  return toGoodsReceiptDetail(data as GoodsReceiptDetailRow)
}

function toGoodsReceiptListItem(row: GoodsReceiptListRow): GoodsReceiptListItem {
  const { supplier, purchase_order, lines, ...receipt } = row
  return {
    ...(receipt as GoodsReceipt),
    supplier_name: supplier?.name ?? null,
    purchase_order_status: purchase_order?.status ?? null,
    line_count: lines?.length ?? 0,
    quality_summary: summarizeQuality(lines ?? []),
  }
}

function summarizeQuality(
  lines: ReadonlyArray<{ quality_status: GoodsReceiptQualityStatus }>
): GoodsReceiptQualityStatus {
  if (lines.some((line) => line.quality_status === 'rejected')) return 'rejected'
  if (lines.some((line) => line.quality_status === 'partial')) return 'partial'
  return 'accepted'
}

function toGoodsReceiptDetail(row: GoodsReceiptDetailRow): GoodsReceiptDetail {
  const { supplier, purchase_order, lines, ...receipt } = row
  return {
    ...(receipt as GoodsReceipt),
    supplier_name: supplier?.name ?? null,
    purchase_order_status: purchase_order?.status ?? null,
    lines: (lines ?? []).map((line) => {
      const { product, unit, ...baseLine } = line
      return {
        ...baseLine,
        product_name: product?.name ?? null,
        product_sku: product?.sku ?? null,
        unit_name: unit?.abbreviation ?? unit?.name ?? null,
      }
    }),
  }
}
