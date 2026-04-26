'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { PaginatedResult, PaginationParams } from '@/lib/pagination'
import type { GoodsReceiptListItem, GoodsReceiptsFilter } from '../domain/types'
import { fetchGoodsReceipts } from '../infrastructure/gr-queries'

export function useGoodsReceipts(
  filter: GoodsReceiptsFilter | undefined,
  pagination?: PaginationParams
) {
  return useQuery<PaginatedResult<GoodsReceiptListItem>>({
    queryKey: ['procurement', 'goods-receipts', 'list', filter, pagination ?? null],
    enabled: !!filter?.hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchGoodsReceipts(supabase, filter!, pagination)
    },
  })
}
