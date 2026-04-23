'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  archiveProduct,
  createProduct,
  fetchProduct,
  fetchProducts,
  restoreProduct,
  updateProduct,
  type UpdateProductInput,
} from '../infrastructure/product-queries'
import type { Product, ProductsFilter } from '../domain/types'
import type { ProductInput } from '../domain/schemas'
import type { PaginatedResult, PaginationParams } from '@/lib/pagination'

export function useProducts(
  filter: ProductsFilter | undefined,
  pagination?: PaginationParams
) {
  return useQuery<PaginatedResult<Product>>({
    queryKey: ['catalog', 'products', 'list', filter, pagination ?? null],
    enabled: !!filter?.hotelId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchProducts(supabase, filter!, pagination)
    },
  })
}

export function useProduct(hotelId: string | undefined, productId: string | undefined) {
  return useQuery<Product>({
    queryKey: ['catalog', 'products', 'detail', hotelId, productId],
    enabled: !!hotelId && !!productId,
    queryFn: async () => {
      const supabase = createClient()
      return fetchProduct(supabase, hotelId!, productId!)
    },
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: ProductInput): Promise<Product> => {
      const supabase = createClient()
      return createProduct(supabase, input)
    },
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: ['catalog', 'products', 'list'] })
      qc.setQueryData(
        ['catalog', 'products', 'detail', product.hotel_id, product.id],
        product
      )
    },
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateProductInput): Promise<Product> => {
      const supabase = createClient()
      return updateProduct(supabase, input)
    },
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: ['catalog', 'products', 'list'] })
      qc.setQueryData(
        ['catalog', 'products', 'detail', product.hotel_id, product.id],
        product
      )
    },
  })
}

export function useArchiveProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      hotelId,
      productId,
    }: {
      hotelId: string
      productId: string
    }): Promise<void> => {
      const supabase = createClient()
      await archiveProduct(supabase, hotelId, productId)
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['catalog', 'products', 'list'] })
      qc.invalidateQueries({
        queryKey: ['catalog', 'products', 'detail', vars.hotelId, vars.productId],
      })
    },
  })
}

export function useRestoreProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      hotelId,
      productId,
    }: {
      hotelId: string
      productId: string
    }): Promise<void> => {
      const supabase = createClient()
      await restoreProduct(supabase, hotelId, productId)
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['catalog', 'products', 'list'] })
      qc.invalidateQueries({
        queryKey: ['catalog', 'products', 'detail', vars.hotelId, vars.productId],
      })
    },
  })
}
