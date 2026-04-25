'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  fetchProductSupplierRefs,
  fetchRefsBySupplier,
} from '../infrastructure/product-supplier-ref-queries'
import type { ProductSupplierRef } from '../domain/types'

export function useProductSupplierRefs(
  hotelId: string | undefined,
  productId: string | undefined
) {
  return useQuery<ProductSupplierRef[]>({
    queryKey: ['catalog', 'product-supplier-refs', 'by-product', hotelId, productId],
    enabled: !!hotelId && !!productId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchProductSupplierRefs(supabase, hotelId!, productId!)
    },
  })
}

export function useRefsBySupplier(
  hotelId: string | undefined,
  supplierId: string | undefined
) {
  return useQuery<ProductSupplierRef[]>({
    queryKey: ['catalog', 'product-supplier-refs', 'by-supplier', hotelId, supplierId],
    enabled: !!hotelId && !!supplierId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchRefsBySupplier(supabase, hotelId!, supplierId!)
    },
  })
}
