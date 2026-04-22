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
      // Invalida todo: el user ahora tiene hotel activo que antes era null.
      queryClient.invalidateQueries()
    },
  })
}
