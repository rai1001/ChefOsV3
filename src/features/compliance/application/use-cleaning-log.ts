'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { CleaningCheckInput, CleaningCheckRpcResult } from '../domain/schemas'
import { completeCleaningCheck } from '../infrastructure/compliance-rpcs'

export function useCompleteCleaningCheck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CleaningCheckInput): Promise<CleaningCheckRpcResult> => {
      const supabase = createClient()
      return completeCleaningCheck(supabase, input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance', 'overview'] })
      queryClient.invalidateQueries({ queryKey: ['compliance', 'cleaning-areas'] })
    },
  })
}

