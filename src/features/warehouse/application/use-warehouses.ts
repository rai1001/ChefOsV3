'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  archiveWarehouse,
  createWarehouse,
  setDefaultWarehouse,
  updateWarehouse,
  type WarehouseMutationResult,
} from '../infrastructure/warehouse-rpcs'
import { fetchWarehouse, fetchWarehouses } from '../infrastructure/warehouse-queries'
import type {
  UpdateWarehouseInput,
  WarehouseIdInput,
  WarehouseInput,
} from '../domain/schemas'
import type { Warehouse, WarehouseFilter } from '../domain/types'

export const WAREHOUSE_QUERY_KEYS = {
  list: (filter: WarehouseFilter | undefined) => ['warehouse', 'list', filter] as const,
  detail: (hotelId: string | undefined, warehouseId: string | undefined) =>
    ['warehouse', 'detail', hotelId, warehouseId] as const,
}

export function useWarehouses(
  filterOrHotelId: WarehouseFilter | string | undefined,
  options?: { activeOnly?: boolean }
) {
  const filter =
    typeof filterOrHotelId === 'string'
      ? { hotelId: filterOrHotelId, activeOnly: options?.activeOnly }
      : filterOrHotelId

  return useQuery<Warehouse[]>({
    queryKey: WAREHOUSE_QUERY_KEYS.list(filter),
    enabled: !!filter?.hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchWarehouses(supabase, filter!)
    },
  })
}

export function useWarehouse(hotelId: string | undefined, warehouseId: string | undefined) {
  return useQuery<Warehouse>({
    queryKey: WAREHOUSE_QUERY_KEYS.detail(hotelId, warehouseId),
    enabled: !!hotelId && !!warehouseId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchWarehouse(supabase, hotelId!, warehouseId!)
    },
  })
}

function invalidateWarehouses(queryClient: QueryClient, hotelId: string) {
  queryClient.invalidateQueries({ queryKey: ['warehouse'] })
  queryClient.invalidateQueries({ queryKey: ['inventory', 'snapshot'] })
  queryClient.invalidateQueries({ queryKey: ['warehouse-stock', hotelId] })
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: WarehouseInput): Promise<WarehouseMutationResult> => {
      const supabase = createClient()
      return createWarehouse(supabase, input)
    },
    onSuccess: (_, input) => invalidateWarehouses(queryClient, input.hotel_id),
  })
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateWarehouseInput): Promise<WarehouseMutationResult> => {
      const supabase = createClient()
      return updateWarehouse(supabase, input)
    },
    onSuccess: (_, input) => invalidateWarehouses(queryClient, input.hotel_id),
  })
}

export function useArchiveWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: WarehouseIdInput): Promise<WarehouseMutationResult> => {
      const supabase = createClient()
      return archiveWarehouse(supabase, input)
    },
    onSuccess: (_, input) => invalidateWarehouses(queryClient, input.hotel_id),
  })
}

export function useSetDefaultWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: WarehouseIdInput): Promise<WarehouseMutationResult> => {
      const supabase = createClient()
      return setDefaultWarehouse(supabase, input)
    },
    onSuccess: (_, input) => invalidateWarehouses(queryClient, input.hotel_id),
  })
}
