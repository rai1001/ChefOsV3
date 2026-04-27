'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { InventorySnapshotFilter, InventorySnapshotItem } from '../domain/snapshot'
import { fetchInventorySnapshot } from '../infrastructure/inventory-queries'

export function useInventorySnapshot(filter: InventorySnapshotFilter | undefined) {
  return useQuery<InventorySnapshotItem[]>({
    queryKey: ['inventory', 'snapshot', filter],
    enabled: !!filter?.hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchInventorySnapshot(supabase, filter!)
    },
  })
}
