'use client'

import { useQuery } from '@tanstack/react-query'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: ['current-user'],
    staleTime: Infinity,
    queryFn: async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      return data.user ?? null
    },
  })
}
