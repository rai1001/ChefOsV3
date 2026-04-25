'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  archiveSupplier,
  createSupplier,
  fetchSupplier,
  fetchSuppliers,
  restoreSupplier,
  updateSupplier,
  type UpdateSupplierInput,
} from '../infrastructure/supplier-queries'
import type { Supplier, SuppliersFilter } from '../domain/types'
import type { SupplierInput } from '../domain/schemas'
import type { PaginatedResult, PaginationParams } from '@/lib/pagination'

export function useSuppliers(
  filter: SuppliersFilter | undefined,
  pagination?: PaginationParams
) {
  return useQuery<PaginatedResult<Supplier>>({
    queryKey: ['catalog', 'suppliers', 'list', filter, pagination ?? null],
    enabled: !!filter?.hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchSuppliers(supabase, filter!, pagination)
    },
  })
}

export function useSupplier(
  hotelId: string | undefined,
  supplierId: string | undefined
) {
  return useQuery<Supplier>({
    queryKey: ['catalog', 'suppliers', 'detail', hotelId, supplierId],
    enabled: !!hotelId && !!supplierId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchSupplier(supabase, hotelId!, supplierId!)
    },
  })
}

export function useCreateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: SupplierInput): Promise<Supplier> => {
      const supabase = createClient()
      return createSupplier(supabase, input)
    },
    onSuccess: (supplier) => {
      qc.invalidateQueries({ queryKey: ['catalog', 'suppliers', 'list'] })
      qc.setQueryData(
        ['catalog', 'suppliers', 'detail', supplier.hotel_id, supplier.id],
        supplier
      )
    },
  })
}

export function useUpdateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateSupplierInput): Promise<Supplier> => {
      const supabase = createClient()
      return updateSupplier(supabase, input)
    },
    onSuccess: (supplier) => {
      qc.invalidateQueries({ queryKey: ['catalog', 'suppliers', 'list'] })
      qc.setQueryData(
        ['catalog', 'suppliers', 'detail', supplier.hotel_id, supplier.id],
        supplier
      )
    },
  })
}

export function useArchiveSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      hotelId,
      supplierId,
    }: {
      hotelId: string
      supplierId: string
    }): Promise<void> => {
      const supabase = createClient()
      await archiveSupplier(supabase, hotelId, supplierId)
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['catalog', 'suppliers', 'list'] })
      qc.invalidateQueries({
        queryKey: ['catalog', 'suppliers', 'detail', vars.hotelId, vars.supplierId],
      })
    },
  })
}

export function useRestoreSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      hotelId,
      supplierId,
    }: {
      hotelId: string
      supplierId: string
    }): Promise<void> => {
      const supabase = createClient()
      await restoreSupplier(supabase, hotelId, supplierId)
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['catalog', 'suppliers', 'list'] })
      qc.invalidateQueries({
        queryKey: ['catalog', 'suppliers', 'detail', vars.hotelId, vars.supplierId],
      })
    },
  })
}
