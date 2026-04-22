'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { calculateEventCostEstimate } from '../infrastructure/beo-queries'

export function useCalculateEventCost(hotelId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventId: string): Promise<number> => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      return calculateEventCostEstimate(supabase, hotelId, eventId)
    },
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['commercial', 'event', hotelId, eventId] })
      queryClient.invalidateQueries({ queryKey: ['commercial', 'event-beo', hotelId, eventId] })
    },
  })
}
