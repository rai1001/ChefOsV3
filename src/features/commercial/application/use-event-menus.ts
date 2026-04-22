'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fetchEventMenus } from '../infrastructure/event-queries'
import type { EventMenu } from '../domain/types'

export function useEventMenus(hotelId: string | undefined, eventId: string | null | undefined) {
  return useQuery<EventMenu[]>({
    queryKey: ['commercial', 'event-menus', hotelId, eventId],
    enabled: !!hotelId && !!eventId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchEventMenus(supabase, hotelId!, eventId!)
    },
  })
}
