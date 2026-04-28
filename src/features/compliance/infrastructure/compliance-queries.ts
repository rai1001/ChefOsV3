import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import {
  qualityCheckSchema,
  temperatureLogSchema,
  type ComplianceQualityCheck,
  type ComplianceTemperatureLog,
} from '../domain/schemas'
import type { ComplianceBaseFilter } from '../domain/filters'
import { complianceDateRangeToRpc } from '../domain/filters'
import { uuidString } from '../domain/shared'

export interface TemperatureLogFilter extends ComplianceBaseFilter {
  equipmentId?: string
}

export const lotSearchOptionSchema = z.object({
  id: uuidString(),
  product_name: z.string().nullable(),
  lot_number: z.string().nullable(),
  received_at: z.string(),
  expires_at: z.string().nullable(),
  quantity_remaining: z.number(),
})

export type LotSearchOption = z.infer<typeof lotSearchOptionSchema>

type LotSearchRow = {
  id: string
  received_at: string
  expires_at: string | null
  quantity_remaining: number
  product?: { name: string | null } | Array<{ name: string | null }> | null
  goods_receipt_line?:
    | { lot_number: string | null }
    | Array<{ lot_number: string | null }>
    | null
}

export async function fetchQualityChecks(
  supabase: SupabaseClient,
  filter: ComplianceBaseFilter
): Promise<ComplianceQualityCheck[]> {
  const range = complianceDateRangeToRpc(filter)
  const { data, error } = await supabase
    .from('v3_compliance_quality_checks')
    .select('*')
    .eq('hotel_id', filter.hotelId)
    .gte('checked_at', range.p_from)
    .lt('checked_at', range.p_to)
    .order('checked_at', { ascending: false })
    .limit(100)

  if (error) throw mapSupabaseError(error, { resource: 'compliance_quality_check' })
  return qualityCheckSchema.array().parse(data ?? [])
}

export async function fetchTemperatureLogs(
  supabase: SupabaseClient,
  filter: TemperatureLogFilter
): Promise<ComplianceTemperatureLog[]> {
  const range = complianceDateRangeToRpc(filter)
  let query = supabase
    .from('v3_compliance_temperature_logs')
    .select('*')
    .eq('hotel_id', filter.hotelId)
    .gte('measured_at', range.p_from)
    .lt('measured_at', range.p_to)
    .order('measured_at', { ascending: true })
    .limit(500)

  if (filter.equipmentId) {
    query = query.eq('equipment_id', filter.equipmentId)
  }

  const { data, error } = await query
  if (error) throw mapSupabaseError(error, { resource: 'compliance_temperature_log' })
  return temperatureLogSchema.array().parse(data ?? [])
}

export async function searchTraceableLots(
  supabase: SupabaseClient,
  hotelId: string,
  search?: string
): Promise<LotSearchOption[]> {
  let query = supabase
    .from('v3_inventory_lots')
    .select(
      `
        id,
        received_at,
        expires_at,
        quantity_remaining,
        product:v3_products!v3_inventory_lots_product_id_fkey(name),
        goods_receipt_line:v3_goods_receipt_lines!v3_inventory_lots_goods_receipt_line_id_fkey(lot_number)
      `
    )
    .eq('hotel_id', hotelId)
    .gt('quantity_remaining', 0)
    .order('received_at', { ascending: false })
    .limit(30)

  if (search) {
    query = query.ilike('id', `%${search}%`)
  }

  const { data, error } = await query
  if (error) throw mapSupabaseError(error, { resource: 'inventory_lot' })

  return (((data ?? []) as unknown) as LotSearchRow[]).map((row) =>
    lotSearchOptionSchema.parse({
      id: row.id,
      product_name: firstRelation(row.product)?.name ?? null,
      lot_number: firstRelation(row.goods_receipt_line)?.lot_number ?? null,
      received_at: row.received_at,
      expires_at: row.expires_at,
      quantity_remaining: row.quantity_remaining,
    })
  )
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}
