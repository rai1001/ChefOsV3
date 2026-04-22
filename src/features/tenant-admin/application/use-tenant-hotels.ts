'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { fetchTenantHotels } from '../infrastructure/tenant-queries'
import type { Hotel } from '@/features/identity'

export function useTenantHotels(tenantId: string | undefined) {
  return useQuery<Hotel[]>({
    queryKey: ['tenant-admin', 'hotels', tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchTenantHotels(supabase, tenantId!)
    },
  })
}
