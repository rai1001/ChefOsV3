'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { GenerateEventPurchaseRequestsResult } from '../domain/types'
import { generatePurchaseRequestsForEvent } from '../infrastructure/event-procurement-queries'

export function useGenerateEventPRs(hotelId: string | undefined) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (eventId: string): Promise<GenerateEventPurchaseRequestsResult> => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      return generatePurchaseRequestsForEvent(supabase, hotelId, eventId)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['procurement', 'purchase-requests', 'list'] })
    },
  })
}
