'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { InventoryMovementDetail } from '../domain/movement'
import { fetchProductMovements } from '../infrastructure/inventory-queries'

export function useProductMovements(
  hotelId: string | undefined,
  productId: string | undefined,
  pagination?: { limit?: number; offset?: number }
) {
  return useQuery<InventoryMovementDetail[]>({
    queryKey: ['inventory', 'movements', hotelId, productId, pagination ?? null],
    enabled: !!hotelId && !!productId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchProductMovements(supabase, hotelId!, productId!, pagination)
    },
  })
}
