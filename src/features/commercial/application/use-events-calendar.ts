'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fetchEventsCalendar } from '../infrastructure/event-queries'
import type { CalendarEvent } from '../domain/types'

export function useEventsCalendar(hotelId: string | undefined, fromDate: string, toDate: string) {
  return useQuery<CalendarEvent[]>({
    queryKey: ['commercial', 'events-calendar', hotelId, fromDate, toDate],
    enabled: !!hotelId && !!fromDate && !!toDate,
    queryFn: async () => {
      const supabase = createClient()
      return fetchEventsCalendar(supabase, hotelId!, fromDate, toDate)
    },
  })
}
