import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import {
  ComplianceNotFoundError,
  ComplianceValidationError,
} from '../domain/errors'
import {
  cleaningCheckInputSchema,
  cleaningCheckRpcResultSchema,
  complianceOverviewSchema,
  lotTraceInputSchema,
  qualityCheckInputSchema,
  qualityCheckRpcResultSchema,
  temperatureLogInputSchema,
  temperatureLogRpcResultSchema,
  traceLotSchema,
  type CleaningCheckInput,
  type CleaningCheckRpcResult,
  type ComplianceOverview,
  type LotTraceInput,
  type QualityCheckInput,
  type QualityCheckRpcResult,
  type TemperatureLogInput,
  type TemperatureLogRpcResult,
  type TraceLotResult,
} from '../domain/schemas'

interface SupabaseErrorLike {
  code?: string
  message?: string
}

function isErrorLike(error: unknown): error is SupabaseErrorLike {
  return error !== null && typeof error === 'object'
}

function mapComplianceError(error: unknown, resource: string): never {
  if (isErrorLike(error) && error.code === 'P0010') {
    throw new ComplianceNotFoundError(resource, error.message)
  }
  if (isErrorLike(error) && error.code === 'P0003') {
    throw new ComplianceValidationError(error.message)
  }
  throw mapSupabaseError(error, { resource })
}

export async function recordGoodsReceiptQualityCheck(
  supabase: SupabaseClient,
  input: QualityCheckInput
): Promise<QualityCheckRpcResult> {
  const parsed = qualityCheckInputSchema.parse(input)
  const { data, error } = await supabase.rpc('v3_record_goods_receipt_quality_check', {
    p_hotel_id: parsed.hotel_id,
    p_goods_receipt_id: parsed.goods_receipt_id,
    p_temperature_c: parsed.temperature_c ?? undefined,
    p_temperature_ok: parsed.temperature_ok,
    p_packaging_ok: parsed.packaging_ok,
    p_expiry_ok: parsed.expiry_ok,
    p_notes: parsed.notes,
  })

  if (error) mapComplianceError(error, 'compliance_quality_check')
  return qualityCheckRpcResultSchema.parse(data)
}

export async function logEquipmentTemperature(
  supabase: SupabaseClient,
  input: TemperatureLogInput
): Promise<TemperatureLogRpcResult> {
  const parsed = temperatureLogInputSchema.parse(input)
  const { data, error } = await supabase.rpc('v3_log_equipment_temperature', {
    p_hotel_id: parsed.hotel_id,
    p_equipment_id: parsed.equipment_id,
    p_temperature_c: parsed.temperature_c,
    p_measured_at: parsed.measured_at ?? undefined,
    p_notes: parsed.notes,
  })

  if (error) mapComplianceError(error, 'compliance_temperature_log')
  return temperatureLogRpcResultSchema.parse(data)
}

export async function completeCleaningCheck(
  supabase: SupabaseClient,
  input: CleaningCheckInput
): Promise<CleaningCheckRpcResult> {
  const parsed = cleaningCheckInputSchema.parse(input)
  const { data, error } = await supabase.rpc('v3_complete_cleaning_check', {
    p_hotel_id: parsed.hotel_id,
    p_area_id: parsed.area_id,
    p_due_date: parsed.due_date ?? undefined,
    p_notes: parsed.notes,
  })

  if (error) mapComplianceError(error, 'compliance_cleaning_check')
  return cleaningCheckRpcResultSchema.parse(data)
}

export async function fetchComplianceOverview(
  supabase: SupabaseClient,
  hotelId: string
): Promise<ComplianceOverview> {
  const { data, error } = await supabase.rpc('v3_get_compliance_overview', {
    p_hotel_id: hotelId,
  })

  if (error) mapComplianceError(error, 'compliance_overview')
  return complianceOverviewSchema.parse(data)
}

export async function traceLot(
  supabase: SupabaseClient,
  input: LotTraceInput
): Promise<TraceLotResult> {
  const parsed = lotTraceInputSchema.parse(input)
  const { data, error } = await supabase.rpc('v3_trace_lot', {
    p_hotel_id: parsed.hotel_id,
    p_lot_id: parsed.lot_id,
  })

  if (error) mapComplianceError(error, 'compliance_lot_trace')
  return traceLotSchema.parse(data)
}
