'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { callGetActiveHotel } from '../infrastructure/identity-queries'
import type { ActiveHotel } from '../domain/types'

export function useActiveHotel() {
  return useQuery<ActiveHotel>({
    queryKey: ['active-hotel'],
    queryFn: async () => {
      const supabase = createClient()
      return callGetActiveHotel(supabase)
    },
  })
}
