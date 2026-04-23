'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  addAlias,
  fetchAliasesForProduct,
  matchProductByAlias,
  removeAlias,
} from '../infrastructure/alias-queries'
import type { ProductAlias, ProductMatch } from '../domain/types'
import type { AliasInput } from '../domain/schemas'

export function useProductAliases(
  hotelId: string | undefined,
  productId: string | undefined
) {
  return useQuery<ProductAlias[]>({
    queryKey: ['catalog', 'aliases', 'list', hotelId, productId],
    enabled: !!hotelId && !!productId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchAliasesForProduct(supabase, hotelId!, productId!)
    },
  })
}

export function useAddAlias() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: AliasInput): Promise<ProductAlias> => {
      const supabase = createClient()
      return addAlias(supabase, input)
    },
    onSuccess: (alias) => {
      qc.invalidateQueries({
        queryKey: ['catalog', 'aliases', 'list', alias.hotel_id, alias.product_id],
      })
      qc.invalidateQueries({ queryKey: ['catalog', 'aliases', 'match'] })
    },
  })
}

export function useRemoveAlias() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      hotelId,
      aliasId,
    }: {
      hotelId: string
      aliasId: string
    }): Promise<void> => {
      const supabase = createClient()
      await removeAlias(supabase, hotelId, aliasId)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['catalog', 'aliases'] })
    },
  })
}

/**
 * Hook reactivo para búsqueda fuzzy de productos por alias.
 * Útil en autocompletar de /recipes/mapping.
 */
export function useMatchProductByAlias(
  hotelId: string | undefined,
  query: string,
  options?: { limit?: number; enabled?: boolean }
) {
  const limit = options?.limit ?? 10
  const enabled = (options?.enabled ?? true) && !!hotelId && query.trim().length > 0

  return useQuery<ProductMatch[]>({
    queryKey: ['catalog', 'aliases', 'match', hotelId, query, limit],
    enabled,
    queryFn: async () => {
      const supabase = createClient()
      return matchProductByAlias(supabase, hotelId!, query, limit)
    },
    staleTime: 10_000, // reutilizar durante 10s (búsquedas typing rápidas)
  })
}
