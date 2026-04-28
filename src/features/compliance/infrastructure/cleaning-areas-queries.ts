import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import {
  cleaningAreaInputSchema,
  cleaningAreaSchema,
  type CleaningAreaInput,
  type ComplianceCleaningArea,
} from '../domain/schemas'
import { ComplianceNotFoundError } from '../domain/errors'

export interface CleaningAreaListFilter {
  hotelId: string
  activeOnly?: boolean
}

export interface UpdateCleaningAreaInput extends Partial<Omit<CleaningAreaInput, 'hotel_id'>> {
  id: string
  hotel_id: string
}

export async function fetchCleaningAreaList(
  supabase: SupabaseClient,
  filter: CleaningAreaListFilter
): Promise<ComplianceCleaningArea[]> {
  let query = supabase
    .from('v3_compliance_cleaning_areas')
    .select('*')
    .eq('hotel_id', filter.hotelId)
    .order('name', { ascending: true })

  if (filter.activeOnly !== false) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query
  if (error) throw mapSupabaseError(error, { resource: 'compliance_cleaning_area' })
  return cleaningAreaSchema.array().parse(data ?? [])
}

export async function createCleaningArea(
  supabase: SupabaseClient,
  input: CleaningAreaInput
): Promise<ComplianceCleaningArea> {
  const parsed = cleaningAreaInputSchema.parse(input)
  const { data, error } = await supabase
    .from('v3_compliance_cleaning_areas')
    .insert({
      hotel_id: parsed.hotel_id,
      name: parsed.name,
      frequency: parsed.frequency,
      description: parsed.description,
      is_active: parsed.is_active,
    })
    .select('*')
    .single()

  if (error) throw mapSupabaseError(error, { resource: 'compliance_cleaning_area' })
  return cleaningAreaSchema.parse(data)
}

export async function updateCleaningArea(
  supabase: SupabaseClient,
  input: UpdateCleaningAreaInput
): Promise<ComplianceCleaningArea> {
  const { id, hotel_id, ...rest } = input
  const patch: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) patch[key] = value
  }

  const { data, error } = await supabase
    .from('v3_compliance_cleaning_areas')
    .update(patch)
    .eq('id', id)
    .eq('hotel_id', hotel_id)
    .select('*')
    .maybeSingle()

  if (error) throw mapSupabaseError(error, { resource: 'compliance_cleaning_area' })
  if (!data) throw new ComplianceNotFoundError('compliance_cleaning_area')
  return cleaningAreaSchema.parse(data)
}
