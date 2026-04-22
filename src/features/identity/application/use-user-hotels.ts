'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { callGetUserHotels } from '../infrastructure/identity-queries'
import type { UserHotel } from '../domain/types'

export function useUserHotels() {
  return useQuery<UserHotel[]>({
    queryKey: ['user-hotels'],
    queryFn: async () => {
      const supabase = createClient()
      return callGetUserHotels(supabase)
    },
  })
}
