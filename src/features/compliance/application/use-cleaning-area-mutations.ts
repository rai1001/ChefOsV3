'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { CleaningAreaInput, ComplianceCleaningArea } from '../domain/schemas'
import {
  createCleaningArea,
  updateCleaningArea,
  type UpdateCleaningAreaInput,
} from '../infrastructure/cleaning-areas-queries'

export function useCreateCleaningArea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CleaningAreaInput): Promise<ComplianceCleaningArea> => {
      const supabase = createClient()
      return createCleaningArea(supabase, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance', 'cleaning-areas'] })
      queryClient.invalidateQueries({ queryKey: ['compliance', 'overview'] })
    },
  })
}

export function useUpdateCleaningArea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateCleaningAreaInput): Promise<ComplianceCleaningArea> => {
      const supabase = createClient()
      return updateCleaningArea(supabase, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance', 'cleaning-areas'] })
      queryClient.invalidateQueries({ queryKey: ['compliance', 'overview'] })
    },
  })
}

