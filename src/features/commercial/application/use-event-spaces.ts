'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fetchEventSpaces } from '../infrastructure/event-queries'
import type { EventSpace } from '../domain/types'

export function useEventSpaces(hotelId: string | undefined, eventId: string | null | undefined) {
  return useQuery<EventSpace[]>({
    queryKey: ['commercial', 'event-spaces', hotelId, eventId],
    enabled: !!hotelId && !!eventId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchEventSpaces(supabase, hotelId!, eventId!)
    },
  })
}
