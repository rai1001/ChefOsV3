'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { importRecipesBulk, type ImportRecipesRpcPayload } from '../infrastructure/import-queries'
import type { ImportResult } from '../domain/types'

interface Variables {
  hotelId: string
  payload: ImportRecipesRpcPayload
}

export function useImportRecipes() {
  const qc = useQueryClient()

  return useMutation<ImportResult, Error, Variables>({
    mutationFn: async ({ hotelId, payload }) => {
      const supabase = createClient()
      return importRecipesBulk(supabase, hotelId, payload)
    },
    onSuccess: (result, { hotelId }) => {
      // Invalida lista de recipes (nuevas en draft) y histórico de import_runs.
      qc.invalidateQueries({ queryKey: ['recipes', hotelId] })
      qc.invalidateQueries({ queryKey: ['import', hotelId, 'runs'] })
      void result
    },
  })
}
