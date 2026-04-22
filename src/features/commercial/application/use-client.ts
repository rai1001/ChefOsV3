'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient as createSupabase } from '@/lib/supabase/client'
import { fetchClient } from '../infrastructure/client-queries'
import type { Client } from '../domain/types'

export function useClient(hotelId: string | undefined, clientId: string | null | undefined) {
  return useQuery<Client>({
    queryKey: ['commercial', 'client', hotelId, clientId],
    enabled: !!hotelId && !!clientId,
    queryFn: async () => {
      const supabase = createSupabase()
      return fetchClient(supabase, hotelId!, clientId!)
    },
  })
}
