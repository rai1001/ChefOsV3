import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import type { SupplierOffer } from '../domain/types'
import { OfferNotFoundError } from '../domain/errors'
import type { OfferInput } from '../domain/schemas'

export async function fetchOffersBySupplier(
  supabase: SupabaseClient,
  hotelId: string,
  supplierId: string
): Promise<SupplierOffer[]> {
  const { data, error } = await supabase
    .from('supplier_offers')
    .select('*')
    .eq('hotel_id', hotelId)
    .eq('supplier_id', supplierId)
    .order('is_preferred', { ascending: false })
    .order('unit_price', { ascending: true })
  if (error) throw mapSupabaseError(error, { resource: 'supplier_offer' })
  return (data as SupplierOffer[]) ?? []
}

export async function fetchOffersByProduct(
  supabase: SupabaseClient,
  hotelId: string,
  productId: string
): Promise<SupplierOffer[]> {
  const { data, error } = await supabase
    .from('supplier_offers')
    .select('*')
    .eq('hotel_id', hotelId)
    .eq('product_id', productId)
    .order('is_preferred', { ascending: false })
    .order('unit_price', { ascending: true })
  if (error) throw mapSupabaseError(error, { resource: 'supplier_offer' })
  return (data as SupplierOffer[]) ?? []
}

export async function createOffer(
  supabase: SupabaseClient,
  input: OfferInput
): Promise<SupplierOffer> {
  const { data, error } = await supabase
    .from('supplier_offers')
    .insert({
      hotel_id: input.hotel_id,
      supplier_id: input.supplier_id,
      product_id: input.product_id,
      unit_id: input.unit_id ?? null,
      unit_price: input.unit_price,
      min_quantity: input.min_quantity ?? null,
      valid_from: input.valid_from ?? null,
      valid_to: input.valid_to ?? null,
      is_preferred: input.is_preferred,
      sku_supplier: input.sku_supplier ?? null,
      notes: input.notes ?? null,
    })
    .select('*')
    .single()
  if (error) throw mapSupabaseError(error, { resource: 'supplier_offer' })
  return data as SupplierOffer
}

export interface UpdateOfferInput extends Partial<Omit<OfferInput, 'hotel_id'>> {
  id: string
  hotel_id: string
}

export async function updateOffer(
  supabase: SupabaseClient,
  input: UpdateOfferInput
): Promise<SupplierOffer> {
  const { id, hotel_id, ...rest } = input
  const patch: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined) patch[k] = v
  }

  const { data, error } = await supabase
    .from('supplier_offers')
    .update(patch)
    .eq('id', id)
    .eq('hotel_id', hotel_id)
    .select('*')
    .maybeSingle()
  if (error) throw mapSupabaseError(error, { resource: 'supplier_offer' })
  if (!data) throw new OfferNotFoundError(id)
  return data as SupplierOffer
}

export async function deleteOffer(
  supabase: SupabaseClient,
  hotelId: string,
  offerId: string
): Promise<void> {
  const { error } = await supabase
    .from('supplier_offers')
    .delete()
    .eq('id', offerId)
    .eq('hotel_id', hotelId)
  if (error) throw mapSupabaseError(error, { resource: 'supplier_offer' })
}

/**
 * RPC mark_offer_preferred — desmarca otras ofertas del mismo producto y marca ésta.
 * Atómico en el server.
 */
export async function markOfferPreferred(
  supabase: SupabaseClient,
  hotelId: string,
  offerId: string
): Promise<void> {
  const { error } = await supabase.rpc('mark_offer_preferred', {
    p_hotel_id: hotelId,
    p_offer_id: offerId,
  })
  if (error) throw mapSupabaseError(error, { resource: 'supplier_offer' })
}
