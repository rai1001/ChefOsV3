'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { callSwitchActiveHotel } from '../infrastructure/identity-queries'

export function useSwitchHotel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (hotelId: string) => {
      const supabase = createClient()
      await callSwitchActiveHotel(supabase, hotelId)
    },
    onSuccess: () => {
      // Al cambiar de hotel, el contexto entero cambia — invalidar todas las queries
      // evita mostrar datos cross-tenant en caché. Agresivo pero seguro (patrón v2).
      queryClient.invalidateQueries()
    },
  })
}
