'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  createOffer,
  deleteOffer,
  fetchOffersByProduct,
  fetchOffersBySupplier,
  markOfferPreferred,
  updateOffer,
  type UpdateOfferInput,
} from '../infrastructure/offer-queries'
import type { SupplierOffer } from '../domain/types'
import type { OfferInput } from '../domain/schemas'

export function useOffersBySupplier(
  hotelId: string | undefined,
  supplierId: string | undefined
) {
  return useQuery<SupplierOffer[]>({
    queryKey: ['catalog', 'offers', 'by-supplier', hotelId, supplierId],
    enabled: !!hotelId && !!supplierId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchOffersBySupplier(supabase, hotelId!, supplierId!)
    },
  })
}

export function useOffersByProduct(
  hotelId: string | undefined,
  productId: string | undefined
) {
  return useQuery<SupplierOffer[]>({
    queryKey: ['catalog', 'offers', 'by-product', hotelId, productId],
    enabled: !!hotelId && !!productId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchOffersByProduct(supabase, hotelId!, productId!)
    },
  })
}

export function useCreateOffer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: OfferInput): Promise<SupplierOffer> => {
      const supabase = createClient()
      return createOffer(supabase, input)
    },
    onSuccess: (offer) => {
      qc.invalidateQueries({
        queryKey: ['catalog', 'offers', 'by-supplier', offer.hotel_id, offer.supplier_id],
      })
      qc.invalidateQueries({
        queryKey: ['catalog', 'offers', 'by-product', offer.hotel_id, offer.product_id],
      })
      qc.invalidateQueries({ queryKey: ['catalog', 'prices'] })
    },
  })
}

export function useUpdateOffer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateOfferInput): Promise<SupplierOffer> => {
      const supabase = createClient()
      return updateOffer(supabase, input)
    },
    onSuccess: (offer) => {
      qc.invalidateQueries({
        queryKey: ['catalog', 'offers', 'by-supplier', offer.hotel_id, offer.supplier_id],
      })
      qc.invalidateQueries({
        queryKey: ['catalog', 'offers', 'by-product', offer.hotel_id, offer.product_id],
      })
      qc.invalidateQueries({ queryKey: ['catalog', 'prices'] })
    },
  })
}

export function useDeleteOffer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      hotelId,
      offerId,
    }: {
      hotelId: string
      offerId: string
    }): Promise<void> => {
      const supabase = createClient()
      await deleteOffer(supabase, hotelId, offerId)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['catalog', 'offers'] })
      qc.invalidateQueries({ queryKey: ['catalog', 'prices'] })
    },
  })
}

/**
 * Marca oferta como preferida vía RPC `mark_offer_preferred`.
 * La RPC desmarca atómicamente las demás del mismo product_id.
 */
export function useMarkOfferPreferred() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      hotelId,
      offerId,
    }: {
      hotelId: string
      offerId: string
    }): Promise<void> => {
      const supabase = createClient()
      await markOfferPreferred(supabase, hotelId, offerId)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['catalog', 'offers'] })
      qc.invalidateQueries({ queryKey: ['catalog', 'prices'] })
    },
  })
}
