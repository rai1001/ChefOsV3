'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient as createSupabase } from '@/lib/supabase/client'
import { fetchClients } from '../infrastructure/client-queries'
import type { Client } from '../domain/types'

export function useClients(hotelId: string | undefined, onlyActive = true) {
  return useQuery<Client[]>({
    queryKey: ['commercial', 'clients', hotelId, onlyActive],
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createSupabase()
      return fetchClients(supabase, hotelId!, onlyActive)
    },
  })
}
