import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import type { ComplianceDateRange } from '../domain/filters'
import { complianceDateRangeToRpc } from '../domain/filters'

export type ComplianceExportName = 'quality' | 'temperature' | 'cleaning' | 'full-monthly'

export const COMPLIANCE_EXPORT_NAMES: readonly ComplianceExportName[] = [
  'quality',
  'temperature',
  'cleaning',
  'full-monthly',
]

const MAX_EXPORT_ROWS = 10_000

type ExportRow = Record<string, string | number | boolean | null>

export function isComplianceExportName(name: string): name is ComplianceExportName {
  return COMPLIANCE_EXPORT_NAMES.includes(name as ComplianceExportName)
}

export async function buildComplianceExportCsv({
  name,
  supabase,
  hotelId,
  range,
}: {
  name: ComplianceExportName
  supabase: SupabaseClient
  hotelId: string
  range: ComplianceDateRange
}): Promise<string> {
  if (name === 'quality') {
    return formatCsv(await fetchQualityExportRows(supabase, hotelId, range))
  }
  if (name === 'temperature') {
    return formatCsv(await fetchTemperatureExportRows(supabase, hotelId, range))
  }
  if (name === 'cleaning') {
    return formatCsv(await fetchCleaningExportRows(supabase, hotelId, range))
  }

  const [quality, temperature, cleaning] = await Promise.all([
    fetchQualityExportRows(supabase, hotelId, range),
    fetchTemperatureExportRows(supabase, hotelId, range),
    fetchCleaningExportRows(supabase, hotelId, range),
  ])
  return formatCsv([
    ...quality.map((row) => ({ section: 'quality', ...row })),
    ...temperature.map((row) => ({ section: 'temperature', ...row })),
    ...cleaning.map((row) => ({ section: 'cleaning', ...row })),
  ])
}

async function fetchQualityExportRows(
  supabase: SupabaseClient,
  hotelId: string,
  range: ComplianceDateRange
): Promise<ExportRow[]> {
  const rpcRange = complianceDateRangeToRpc(range)
  const { data, error } = await supabase
    .from('v3_compliance_quality_checks')
    .select('*')
    .eq('hotel_id', hotelId)
    .gte('checked_at', rpcRange.p_from)
    .lt('checked_at', rpcRange.p_to)
    .order('checked_at', { ascending: false })
    .limit(MAX_EXPORT_ROWS)

  if (error) throw mapSupabaseError(error, { resource: 'compliance_quality_check' })
  return (data ?? []) as ExportRow[]
}

async function fetchTemperatureExportRows(
  supabase: SupabaseClient,
  hotelId: string,
  range: ComplianceDateRange
): Promise<ExportRow[]> {
  const rpcRange = complianceDateRangeToRpc(range)
  const { data, error } = await supabase
    .from('v3_compliance_temperature_logs')
    .select('*')
    .eq('hotel_id', hotelId)
    .gte('measured_at', rpcRange.p_from)
    .lt('measured_at', rpcRange.p_to)
    .order('measured_at', { ascending: false })
    .limit(MAX_EXPORT_ROWS)

  if (error) throw mapSupabaseError(error, { resource: 'compliance_temperature_log' })
  return (data ?? []) as ExportRow[]
}

async function fetchCleaningExportRows(
  supabase: SupabaseClient,
  hotelId: string,
  range: ComplianceDateRange
): Promise<ExportRow[]> {
  const { data, error } = await supabase
    .from('v3_compliance_cleaning_checks')
    .select('*')
    .eq('hotel_id', hotelId)
    .gte('due_date', range.from)
    .lt('due_date', range.to)
    .order('due_date', { ascending: false })
    .limit(MAX_EXPORT_ROWS)

  if (error) throw mapSupabaseError(error, { resource: 'compliance_cleaning_check' })
  return (data ?? []) as ExportRow[]
}

function serializeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  const serialized = value instanceof Date ? value.toISOString() : String(value)
  if (/[",\r\n]/.test(serialized)) return `"${serialized.replaceAll('"', '""')}"`
  return serialized
}

function formatCsv(rows: ExportRow[]): string {
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))]
  const header = columns.map(serializeCsvValue).join(',')
  const body = rows.map((row) =>
    columns.map((column) => serializeCsvValue(row[column])).join(',')
  )
  return `\ufeff${[header, ...body].join('\r\n')}`
}

