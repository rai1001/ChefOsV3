'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { generateEventOperationalImpact } from '../infrastructure/beo-queries'

export function useGenerateOperationalImpact(hotelId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventId: string): Promise<number> => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      return generateEventOperationalImpact(supabase, hotelId, eventId)
    },
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ['commercial', 'event-beo', hotelId, eventId] })
    },
  })
}
