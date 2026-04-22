'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fetchEvents } from '../infrastructure/event-queries'
import type { Event, EventsFilter } from '../domain/types'

export function useEvents(hotelId: string | undefined, filter?: EventsFilter) {
  return useQuery<Event[]>({
    queryKey: ['commercial', 'events', hotelId, filter],
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchEvents(supabase, hotelId!, filter)
    },
  })
}
