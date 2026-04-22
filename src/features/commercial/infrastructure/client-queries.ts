import type { SupabaseClient } from '@supabase/supabase-js'
import type { Client, VipLevel } from '../domain/types'
import { ClientNotFoundError } from '../domain/errors'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import {
  buildPaginatedResult,
  pageRange,
  type PaginatedResult,
  type PaginationParams,
} from '@/lib/pagination'

export async function fetchClients(
  supabase: SupabaseClient,
  hotelId: string,
  onlyActive = true,
  pagination?: PaginationParams
): Promise<PaginatedResult<Client>> {
  const { from, to, pageSize } = pageRange(pagination)
  let query = supabase
    .from('clients')
    .select('*')
    .eq('hotel_id', hotelId)
    .order('name', { ascending: true })
    .range(from, to)

  if (onlyActive) query = query.eq('is_active', true)

  const { data, error } = await query
  if (error) throw mapSupabaseError(error, { resource: 'client' })
  return buildPaginatedResult((data as Client[]) ?? [], pageSize, from)
}

export async function fetchClient(
  supabase: SupabaseClient,
  hotelId: string,
  clientId: string
): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .eq('hotel_id', hotelId)
    .maybeSingle()

  if (error) throw mapSupabaseError(error, { resource: 'client' })
  if (!data) throw new ClientNotFoundError(clientId)
  return data as Client
}

export interface CreateClientInput {
  name: string
  company?: string | null
  contact_person?: string | null
  email?: string | null
  phone?: string | null
  tax_id?: string | null
  vip_level?: VipLevel
  notes?: string | null
}

export async function createClient(
  supabase: SupabaseClient,
  hotelId: string,
  input: CreateClientInput
): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert({
      hotel_id: hotelId,
      name: input.name,
      company: input.company ?? null,
      contact_person: input.contact_person ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      tax_id: input.tax_id ?? null,
      vip_level: input.vip_level ?? 'standard',
      notes: input.notes ?? null,
      is_active: true,
    })
    .select()
    .single()

  if (error) throw mapSupabaseError(error, { resource: 'client' })
  return data as Client
}

export interface UpdateClientInput extends Partial<CreateClientInput> {
  is_active?: boolean
}

export async function updateClient(
  supabase: SupabaseClient,
  hotelId: string,
  clientId: string,
  input: UpdateClientInput
): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update(input)
    .eq('id', clientId)
    .eq('hotel_id', hotelId)
    .select()
    .single()

  if (error) throw mapSupabaseError(error, { resource: 'client' })
  return data as Client
}
