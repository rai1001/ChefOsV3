'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  fetchUnmappedIngredients,
  resolveMappingBulk,
  type UnmappedIngredientRow,
} from '../infrastructure/mapping-queries'
import type { MappingResult } from '../domain/types'
import type { MappingPayload } from '../domain/schemas'

/**
 * Lista de ingredientes de recipe_ingredients con product_id NULL o unit_id NULL.
 * Fuente de datos para la pantalla /recipes/mapping.
 */
export function useUnmappedIngredients(hotelId: string | undefined, limit = 200) {
  return useQuery<UnmappedIngredientRow[]>({
    queryKey: ['recipes', 'mapping', 'unmapped', hotelId, limit],
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchUnmappedIngredients(supabase, hotelId!, limit)
    },
  })
}

/**
 * Aplica un mapping bulk via RPC resolve_ingredient_mapping_bulk.
 */
export function useResolveMappingBulk() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      hotelId,
      payload,
    }: {
      hotelId: string
      payload: MappingPayload
    }): Promise<MappingResult> => {
      const supabase = createClient()
      return resolveMappingBulk(supabase, hotelId, payload)
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: ['recipes', 'mapping', 'unmapped', vars.hotelId],
      })
      qc.invalidateQueries({ queryKey: ['recipes', 'list'] })
      qc.invalidateQueries({ queryKey: ['recipes', 'detail'] })
    },
  })
}
