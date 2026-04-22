'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient as createSupabase } from '@/lib/supabase/client'
import { createClient, type CreateClientInput } from '../infrastructure/client-queries'
import type { Client } from '../domain/types'

export function useCreateClient(hotelId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateClientInput): Promise<Client> => {
      if (!hotelId) throw new Error('hotelId requerido')
      const supabase = createSupabase()
      return createClient(supabase, hotelId, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commercial', 'clients'] })
    },
  })
}
