'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { GoodsReceiptDetail } from '../domain/types'
import { fetchGoodsReceipt } from '../infrastructure/gr-queries'

export function useGoodsReceipt(receiptId: string | undefined) {
  return useQuery<GoodsReceiptDetail>({
    queryKey: ['procurement', 'goods-receipts', 'detail', receiptId],
    enabled: !!receiptId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchGoodsReceipt(supabase, receiptId!)
    },
  })
}
