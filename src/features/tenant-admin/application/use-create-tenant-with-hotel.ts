'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { createTenantWithHotel, type CreateTenantWithHotelResult } from '../infrastructure/tenant-queries'
import type { TenantWithHotelInput } from '../domain/types'

export function useCreateTenantWithHotel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: TenantWithHotelInput): Promise<CreateTenantWithHotelResult> => {
      const supabase = createClient()
      return createTenantWithHotel(supabase, input)
    },
    onSuccess: () => {
      // Revalidate the layout because the user's active hotel changed from null.
      queryClient.invalidateQueries()
    },
  })
}
