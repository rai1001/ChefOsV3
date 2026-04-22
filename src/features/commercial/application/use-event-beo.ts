'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fetchEventBeo } from '../infrastructure/beo-queries'
import type { BeoData } from '../domain/types'

export function useEventBeo(hotelId: string | undefined, eventId: string | null | undefined) {
  return useQuery<BeoData>({
    queryKey: ['commercial', 'event-beo', hotelId, eventId],
    enabled: !!hotelId && !!eventId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchEventBeo(supabase, hotelId!, eventId!)
    },
  })
}
