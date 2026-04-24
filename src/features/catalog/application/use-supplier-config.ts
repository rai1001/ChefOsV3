'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  fetchSupplierConfig,
  upsertSupplierConfig,
} from '../infrastructure/supplier-config-queries'
import type { SupplierConfig } from '../domain/types'
import type { SupplierConfigInput } from '../domain/schemas'

export function useSupplierConfig(
  hotelId: string | undefined,
  supplierId: string | undefined
) {
  return useQuery<SupplierConfig | null>({
    queryKey: ['catalog', 'supplier-config', hotelId, supplierId],
    enabled: !!hotelId && !!supplierId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchSupplierConfig(supabase, hotelId!, supplierId!)
    },
  })
}

export function useUpsertSupplierConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: SupplierConfigInput): Promise<SupplierConfig> => {
      const supabase = createClient()
      return upsertSupplierConfig(supabase, input)
    },
    onSuccess: (cfg) => {
      qc.setQueryData(
        ['catalog', 'supplier-config', cfg.hotel_id, cfg.supplier_id],
        cfg
      )
    },
  })
}
