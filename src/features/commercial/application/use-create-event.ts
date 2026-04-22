'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { createEvent, type CreateEventInput } from '../infrastructure/event-queries'

export function useCreateEvent(hotelId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateEventInput): Promise<string> => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      return createEvent(supabase, hotelId, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial', 'events'] })
      queryClient.invalidateQueries({ queryKey: ['commercial', 'events-calendar'] })
    },
  })
}
