'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { createHotel } from '../infrastructure/tenant-queries'
import type { CreateHotelInput } from '../domain/types'

export function useCreateHotel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateHotelInput): Promise<string> => {
      const supabase = createClient()
      return createHotel(supabase, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-admin', 'hotels'] })
      queryClient.invalidateQueries({ queryKey: ['user-hotels'] })
    },
  })
}
