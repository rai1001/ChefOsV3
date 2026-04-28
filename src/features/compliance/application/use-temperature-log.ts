'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { TemperatureLogInput, TemperatureLogRpcResult } from '../domain/schemas'
import { logEquipmentTemperature } from '../infrastructure/compliance-rpcs'

export function useLogEquipmentTemperature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: TemperatureLogInput): Promise<TemperatureLogRpcResult> => {
      const supabase = createClient()
      return logEquipmentTemperature(supabase, input)
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['compliance', 'overview'] })
      queryClient.invalidateQueries({ queryKey: ['compliance', 'temperature-logs'] })
      queryClient.invalidateQueries({
        queryKey: ['compliance', 'temperature-logs', result.row.hotel_id],
      })
    },
  })
}

