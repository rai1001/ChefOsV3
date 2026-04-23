'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { transitionEvent } from '../infrastructure/event-queries'
import type { EventStatus } from '../domain/types'

interface TransitionArgs {
  eventId: string
  newStatus: EventStatus
  reason?: string
}

export function useTransitionEvent(hotelId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ eventId, newStatus, reason }: TransitionArgs) => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createClient()
      await transitionEvent(supabase, hotelId, eventId, newStatus, reason)
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['commercial', 'events'] })
      queryClient.invalidateQueries({ queryKey: ['commercial', 'event', hotelId, vars.eventId] })
      queryClient.invalidateQueries({ queryKey: ['commercial', 'events-calendar'] })
      queryClient.invalidateQueries({
        queryKey: ['commercial', 'event-beo', hotelId, vars.eventId],
      })
    },
  })
}
