import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import type { UnitOfMeasure } from '../domain/types'

// ─── Lista per-hotel ──────────────────────────────────────────────────────────

export async function fetchUnits(
  supabase: SupabaseClient,
  hotelId: string
): Promise<UnitOfMeasure[]> {
  const { data, error } = await supabase
    .from('units_of_measure')
    .select('*')
    .eq('hotel_id', hotelId)
    .order('unit_type', { ascending: true })
    .order('conversion_factor', { ascending: true })
  if (error) throw mapSupabaseError(error, { resource: 'unit_of_measure' })
  return (data as UnitOfMeasure[]) ?? []
}

// ─── Agrupación por unit_type ─────────────────────────────────────────────────

export async function fetchUnitsByType(
  supabase: SupabaseClient,
  hotelId: string
): Promise<Record<string, UnitOfMeasure[]>> {
  const list = await fetchUnits(supabase, hotelId)
  const byType: Record<string, UnitOfMeasure[]> = {}
  for (const u of list) {
    const bucket = byType[u.unit_type] ?? (byType[u.unit_type] = [])
    bucket.push(u)
  }
  return byType
}

// ─── Lectura individual ───────────────────────────────────────────────────────

export async function fetchUnit(
  supabase: SupabaseClient,
  hotelId: string,
  unitId: string
): Promise<UnitOfMeasure | null> {
  const { data, error } = await supabase
    .from('units_of_measure')
    .select('*')
    .eq('id', unitId)
    .eq('hotel_id', hotelId)
    .maybeSingle()
  if (error) throw mapSupabaseError(error, { resource: 'unit_of_measure' })
  return data as UnitOfMeasure | null
}
