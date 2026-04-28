import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import {
  equipmentInputSchema,
  equipmentSchema,
  type ComplianceEquipment,
  type EquipmentInput,
} from '../domain/schemas'
import { ComplianceNotFoundError } from '../domain/errors'

export interface EquipmentListFilter {
  hotelId: string
  activeOnly?: boolean
}

export interface UpdateEquipmentInput extends Partial<Omit<EquipmentInput, 'hotel_id'>> {
  id: string
  hotel_id: string
}

export async function fetchEquipmentList(
  supabase: SupabaseClient,
  filter: EquipmentListFilter
): Promise<ComplianceEquipment[]> {
  let query = supabase
    .from('v3_compliance_equipment')
    .select('*')
    .eq('hotel_id', filter.hotelId)
    .order('name', { ascending: true })

  if (filter.activeOnly !== false) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query
  if (error) throw mapSupabaseError(error, { resource: 'compliance_equipment' })
  return equipmentSchema.array().parse(data ?? [])
}

export async function createEquipment(
  supabase: SupabaseClient,
  input: EquipmentInput
): Promise<ComplianceEquipment> {
  const parsed = equipmentInputSchema.parse(input)
  const { data, error } = await supabase
    .from('v3_compliance_equipment')
    .insert({
      hotel_id: parsed.hotel_id,
      warehouse_id: parsed.warehouse_id ?? null,
      name: parsed.name,
      equipment_type: parsed.equipment_type,
      location: parsed.location,
      min_temperature_c: parsed.min_temperature_c,
      max_temperature_c: parsed.max_temperature_c,
      is_active: parsed.is_active,
    })
    .select('*')
    .single()

  if (error) throw mapSupabaseError(error, { resource: 'compliance_equipment' })
  return equipmentSchema.parse(data)
}

export async function updateEquipment(
  supabase: SupabaseClient,
  input: UpdateEquipmentInput
): Promise<ComplianceEquipment> {
  const { id, hotel_id, ...rest } = input
  const patch: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) patch[key] = value
  }

  const { data, error } = await supabase
    .from('v3_compliance_equipment')
    .update(patch)
    .eq('id', id)
    .eq('hotel_id', hotel_id)
    .select('*')
    .maybeSingle()

  if (error) throw mapSupabaseError(error, { resource: 'compliance_equipment' })
  if (!data) throw new ComplianceNotFoundError('compliance_equipment')
  return equipmentSchema.parse(data)
}

