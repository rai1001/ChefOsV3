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

interface ColumnSpec {
  key: string
  header: string
}

const QUALITY_COLUMNS: readonly ColumnSpec[] = [
  { key: 'checked_at', header: 'Fecha' },
  { key: 'goods_receipt_id', header: 'Recepción ID' },
  { key: 'temperature_c', header: 'Temperatura °C' },
  { key: 'temperature_ok', header: 'Temp OK' },
  { key: 'packaging_ok', header: 'Embalaje OK' },
  { key: 'expiry_ok', header: 'Caducidad OK' },
  { key: 'all_ok', header: 'Conforme' },
  { key: 'notes', header: 'Notas' },
]

const TEMPERATURE_COLUMNS: readonly ColumnSpec[] = [
  { key: 'measured_at', header: 'Fecha' },
  { key: 'equipment_name', header: 'Equipo' },
  { key: 'temperature_c', header: 'Temperatura °C' },
  { key: 'min_temperature_c', header: 'Mín °C' },
  { key: 'max_temperature_c', header: 'Máx °C' },
  { key: 'in_range', header: 'En rango' },
  { key: 'notes', header: 'Notas' },
]

const CLEANING_COLUMNS: readonly ColumnSpec[] = [
  { key: 'due_date', header: 'Fecha programada' },
  { key: 'area_name', header: 'Área' },
  { key: 'frequency', header: 'Frecuencia' },
  { key: 'completed_at', header: 'Completado' },
  { key: 'notes', header: 'Notas' },
]

const FULL_COLUMNS: readonly ColumnSpec[] = [
  { key: 'section', header: 'Sección' },
  { key: 'date', header: 'Fecha' },
  { key: 'subject', header: 'Sujeto' },
  { key: 'value', header: 'Valor' },
  { key: 'ok', header: 'Conforme' },
  { key: 'notes', header: 'Notas' },
]

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
    return formatCsv(await fetchQualityExportRows(supabase, hotelId, range), QUALITY_COLUMNS)
  }
  if (name === 'temperature') {
    return formatCsv(await fetchTemperatureExportRows(supabase, hotelId, range), TEMPERATURE_COLUMNS)
  }
  if (name === 'cleaning') {
    return formatCsv(await fetchCleaningExportRows(supabase, hotelId, range), CLEANING_COLUMNS)
  }

  const [quality, temperature, cleaning] = await Promise.all([
    fetchQualityExportRows(supabase, hotelId, range),
    fetchTemperatureExportRows(supabase, hotelId, range),
    fetchCleaningExportRows(supabase, hotelId, range),
  ])

  const merged: ExportRow[] = [
    ...quality.map((row): ExportRow => ({
      section: 'recepción',
      date: row.checked_at ?? null,
      subject: row.goods_receipt_id ?? null,
      value: row.temperature_c ?? null,
      ok: row.all_ok ?? null,
      notes: row.notes ?? null,
    })),
    ...temperature.map((row): ExportRow => ({
      section: 'temperatura',
      date: row.measured_at ?? null,
      subject: row.equipment_name ?? null,
      value: row.temperature_c ?? null,
      ok: row.in_range ?? null,
      notes: row.notes ?? null,
    })),
    ...cleaning.map((row): ExportRow => ({
      section: 'limpieza',
      date: row.due_date ?? null,
      subject: row.area_name ?? null,
      value: row.frequency ?? null,
      ok: row.completed_at !== null,
      notes: row.notes ?? null,
    })),
  ]
  return formatCsv(merged, FULL_COLUMNS)
}

async function fetchQualityExportRows(
  supabase: SupabaseClient,
  hotelId: string,
  range: ComplianceDateRange
): Promise<ExportRow[]> {
  const rpcRange = complianceDateRangeToRpc(range)
  const { data, error } = await supabase
    .from('v3_compliance_quality_checks')
    .select(
      'checked_at, goods_receipt_id, temperature_c, temperature_ok, packaging_ok, expiry_ok, all_ok, notes'
    )
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
    .select(
      'measured_at, temperature_c, min_temperature_c, max_temperature_c, in_range, notes, equipment:v3_compliance_equipment!v3_compliance_temperature_logs_equipment_id_fkey(name)'
    )
    .eq('hotel_id', hotelId)
    .gte('measured_at', rpcRange.p_from)
    .lt('measured_at', rpcRange.p_to)
    .order('measured_at', { ascending: false })
    .limit(MAX_EXPORT_ROWS)

  if (error) throw mapSupabaseError(error, { resource: 'compliance_temperature_log' })
  type TempRow = {
    measured_at: string
    temperature_c: number
    min_temperature_c: number
    max_temperature_c: number
    in_range: boolean | null
    notes: string | null
    equipment: { name: string } | { name: string }[] | null
  }
  return (data ?? []).map((row) => {
    const r = row as unknown as TempRow
    const equipment = Array.isArray(r.equipment) ? r.equipment[0] : r.equipment
    return {
      measured_at: r.measured_at,
      equipment_name: equipment?.name ?? null,
      temperature_c: r.temperature_c,
      min_temperature_c: r.min_temperature_c,
      max_temperature_c: r.max_temperature_c,
      in_range: r.in_range,
      notes: r.notes,
    }
  })
}

async function fetchCleaningExportRows(
  supabase: SupabaseClient,
  hotelId: string,
  range: ComplianceDateRange
): Promise<ExportRow[]> {
  const { data, error } = await supabase
    .from('v3_compliance_cleaning_checks')
    .select(
      'due_date, completed_at, notes, area:v3_compliance_cleaning_areas!v3_compliance_cleaning_checks_area_id_fkey(name, frequency)'
    )
    .eq('hotel_id', hotelId)
    .gte('due_date', range.from)
    .lt('due_date', range.to)
    .order('due_date', { ascending: false })
    .limit(MAX_EXPORT_ROWS)

  if (error) throw mapSupabaseError(error, { resource: 'compliance_cleaning_check' })
  type CleanRow = {
    due_date: string
    completed_at: string | null
    notes: string | null
    area: { name: string; frequency: string } | { name: string; frequency: string }[] | null
  }
  return (data ?? []).map((row) => {
    const r = row as unknown as CleanRow
    const area = Array.isArray(r.area) ? r.area[0] : r.area
    return {
      due_date: r.due_date,
      area_name: area?.name ?? null,
      frequency: area?.frequency ?? null,
      completed_at: r.completed_at,
      notes: r.notes,
    }
  })
}

function serializeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  const serialized = value instanceof Date ? value.toISOString() : String(value)
  const formulaHardened = /^[\t\r ]*[=+\-@]|^[\t\r]/.test(serialized)
    ? `'${serialized}`
    : serialized
  if (/[",\r\n]/.test(formulaHardened)) return `"${formulaHardened.replaceAll('"', '""')}"`
  return formulaHardened
}

function formatCsv(rows: ExportRow[], columns: readonly ColumnSpec[]): string {
  const header = columns.map((col) => serializeCsvValue(col.header)).join(',')
  const body = rows.map((row) =>
    columns.map((col) => serializeCsvValue(row[col.key])).join(',')
  )
  return `﻿${[header, ...body].join('\r\n')}`
}
