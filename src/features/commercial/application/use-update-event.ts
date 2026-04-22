'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { updateEvent, type UpdateEventInput } from '../infrastructure/event-queries'

interface UpdateArgs {
  eventId: string
  input: UpdateEventInput
  changeReason?: string
}

export function useUpdateEvent(hotelId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, input, changeReason }: UpdateArgs) => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      await updateEvent(supabase, hotelId, eventId, input, changeReason)
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['commercial', 'events'] })
      queryClient.invalidateQueries({ queryKey: ['commercial', 'event', hotelId, vars.eventId] })
      queryClient.invalidateQueries({ queryKey: ['commercial', 'events-calendar'] })
    },
  })
}
