'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ReceiveGoodsInput } from '../domain/schemas'
import type { ReceiveGoodsResult } from '../domain/types'
import { receiveGoods } from '../infrastructure/gr-rpcs'

export function useReceiveGoods() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: ReceiveGoodsInput): Promise<ReceiveGoodsResult> => {
      const supabase = createClient()
      return receiveGoods(supabase, input)
    },
    onSuccess: (result, input) => {
      qc.invalidateQueries({ queryKey: ['procurement', 'purchase-orders', 'list'] })
      qc.invalidateQueries({
        queryKey: [
          'procurement',
          'purchase-orders',
          'detail',
          input.hotel_id,
          input.purchase_order_id,
        ],
      })
      qc.invalidateQueries({
        queryKey: [
          'procurement',
          'purchase-orders',
          'lines',
          input.hotel_id,
          input.purchase_order_id,
        ],
      })
      qc.invalidateQueries({ queryKey: ['procurement', 'goods-receipts', 'list'] })
      qc.invalidateQueries({
        queryKey: ['procurement', 'goods-receipts', 'detail', result.goods_receipt_id],
      })
    },
  })
}
