'use client'

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fetchEvents } from '../infrastructure/event-queries'
import type { Event, EventsFilter } from '../domain/types'
import { parseCursor, type PaginatedResult, type PaginationParams } from '@/lib/pagination'

export function useEvents(
  hotelId: string | undefined,
  filter?: EventsFilter,
  pagination?: PaginationParams
) {
  return useQuery<PaginatedResult<Event>>({
    queryKey: ['commercial', hotelId, 'events', filter, pagination ?? null],
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchEvents(supabase, hotelId!, filter, pagination)
    },
  })
}

// Hook para listas con "Cargar más" — agrupa páginas en `data.pages[].rows`.
export function useEventsInfinite(
  hotelId: string | undefined,
  filter?: EventsFilter,
  pageSize?: number
) {
  return useInfiniteQuery<PaginatedResult<Event>>({
    queryKey: ['commercial', hotelId, 'events', 'infinite', filter, pageSize ?? null],
    enabled: !!hotelId,
    initialPageParam: '0',
    queryFn: async ({ pageParam }) => {
      const supabase = createClient()
      return fetchEvents(supabase, hotelId!, filter, {
        pageSize,
        offset: parseCursor(pageParam as string | null),
      })
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}
