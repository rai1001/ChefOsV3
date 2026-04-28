'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ComplianceEquipment, EquipmentInput } from '../domain/schemas'
import {
  createEquipment,
  updateEquipment,
  type UpdateEquipmentInput,
} from '../infrastructure/equipment-queries'

export function useCreateEquipment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: EquipmentInput): Promise<ComplianceEquipment> => {
      const supabase = createClient()
      return createEquipment(supabase, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance', 'equipment'] })
      queryClient.invalidateQueries({ queryKey: ['compliance', 'overview'] })
    },
  })
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateEquipmentInput): Promise<ComplianceEquipment> => {
      const supabase = createClient()
      return updateEquipment(supabase, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance', 'equipment'] })
      queryClient.invalidateQueries({ queryKey: ['compliance', 'overview'] })
    },
  })
}

