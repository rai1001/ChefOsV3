'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fetchEvent } from '../infrastructure/event-queries'
import type { Event } from '../domain/types'

export function useEvent(hotelId: string | undefined, eventId: string | null | undefined) {
  return useQuery<Event>({
    queryKey: ['commercial', 'event', hotelId, eventId],
    enabled: !!hotelId && !!eventId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchEvent(supabase, hotelId!, eventId!)
    },
  })
}
