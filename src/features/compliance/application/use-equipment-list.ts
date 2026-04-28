'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ComplianceEquipment } from '../domain/schemas'
import { fetchEquipmentList } from '../infrastructure/equipment-queries'
import { COMPLIANCE_QUERY_KEYS, COMPLIANCE_QUERY_OPTIONS } from './query-options'

export function useEquipmentList(
  hotelId: string | undefined,
  options?: { activeOnly?: boolean }
) {
  const activeOnly = options?.activeOnly ?? true
  return useQuery<ComplianceEquipment[]>({
    queryKey: COMPLIANCE_QUERY_KEYS.equipment(hotelId, activeOnly),
    enabled: !!hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchEquipmentList(supabase, { hotelId: hotelId!, activeOnly })
    },
    ...COMPLIANCE_QUERY_OPTIONS.list,
  })
}

