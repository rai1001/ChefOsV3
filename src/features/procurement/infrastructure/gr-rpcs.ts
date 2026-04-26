import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import type { ReceiveGoodsInput } from '../domain/schemas'
import type { ReceiveGoodsResult } from '../domain/types'

export async function receiveGoods(
  supabase: SupabaseClient,
  input: ReceiveGoodsInput
): Promise<ReceiveGoodsResult> {
  const params: {
    p_hotel_id: string
    p_purchase_order_id: string
    p_lines: ReceiveGoodsInput['lines']
    p_received_at?: string
    p_notes?: string | null
  } = {
    p_hotel_id: input.hotel_id,
    p_purchase_order_id: input.purchase_order_id,
    p_lines: input.lines,
  }

  if (input.received_at) {
    params.p_received_at = input.received_at
  }
  if (input.notes !== undefined) {
    params.p_notes = input.notes ?? null
  }

  const { data, error } = await supabase.rpc('v3_receive_goods', params)
  if (error) throw mapSupabaseError(error, { resource: 'goods_receipt' })
  return data as ReceiveGoodsResult
}
