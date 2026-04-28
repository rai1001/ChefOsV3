'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { WarehouseStockItem } from '../domain/types'
import { getStockByWarehouse } from '../infrastructure/warehouse-rpcs'

export function useStockByWarehouse(
  hotelId: string | undefined,
  productId?: string | null
) {
  return useQuery<WarehouseStockItem[]>({
    queryKey: ['warehouse-stock', hotelId, productId ?? null],
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return getStockByWarehouse(supabase, {
        hotel_id: hotelId!,
        product_id: productId ?? null,
      })
    },
  })
}
