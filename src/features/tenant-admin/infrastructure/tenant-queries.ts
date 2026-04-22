import type { SupabaseClient } from '@supabase/supabase-js'
import type { Hotel } from '@/features/identity'
import type { CreateHotelInput, TenantWithHotelInput } from '../domain/types'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'

export interface CreateTenantWithHotelResult {
  tenant_id: string
  hotel_id: string
}

export async function createTenantWithHotel(
  supabase: SupabaseClient,
  input: TenantWithHotelInput
): Promise<CreateTenantWithHotelResult> {
  const { data, error } = await supabase.rpc('create_tenant_with_hotel', {
    p_tenant_name: input.tenant_name,
    p_hotel_name: input.hotel_name,
    p_hotel_slug: input.hotel_slug,
    p_timezone: input.timezone,
    p_currency: input.currency,
  })
  if (error) throw mapSupabaseError(error, { resource: 'hotel' })
  return data as CreateTenantWithHotelResult
}

export async function fetchTenantHotels(
  supabase: SupabaseClient,
  tenantId: string
): Promise<Hotel[]> {
  const { data, error } = await supabase
    .from('hotels')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: true })
  if (error) throw mapSupabaseError(error, { resource: 'hotel' })
  return (data as Hotel[]) ?? []
}

export async function createHotel(
  supabase: SupabaseClient,
  input: CreateHotelInput
): Promise<string> {
  // Reutiliza RPC create_hotel de v2 si existe; si no, fallback a insert directo.
  const { data, error } = await supabase.rpc('create_hotel', {
    p_tenant_id: input.tenant_id,
    p_hotel_name: input.name,
    p_hotel_slug: input.slug,
    p_timezone: input.timezone,
    p_currency: input.currency,
  })
  if (error) {
    // Si RPC no existe (v2 nunca la expuso), hacemos insert + crear membership admin manual.
    if (typeof error === 'object' && 'code' in error && (error as { code: string }).code === '42883') {
      return insertHotelFallback(supabase, input)
    }
    throw error
  }
  return data as string
}

async function insertHotelFallback(
  supabase: SupabaseClient,
  input: CreateHotelInput
): Promise<string> {
  const { data, error } = await supabase
    .from('hotels')
    .insert({
      tenant_id: input.tenant_id,
      name: input.name,
      slug: input.slug,
      timezone: input.timezone,
      currency: input.currency,
      is_active: true,
    })
    .select('id')
    .single()
  if (error) throw mapSupabaseError(error, { resource: 'hotel' })
  return (data as { id: string }).id
}
