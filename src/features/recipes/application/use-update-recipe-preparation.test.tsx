import React from 'react'
import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createClient } from '@/lib/supabase/client'
import { updateRecipePreparation } from '../infrastructure/recipe-queries'
import { useUpdateRecipePreparation } from './use-update-recipe-preparation'

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

vi.mock('../infrastructure/recipe-queries', () => ({
  updateRecipePreparation: vi.fn(),
}))

const hotelId = '11111111-1111-4111-8111-111111111111'
const recipeId = '22222222-2222-4222-8222-222222222222'
const productId = '33333333-3333-4333-8333-333333333333'

describe('useUpdateRecipePreparation', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
    })
    vi.spyOn(queryClient, 'invalidateQueries')
  })

  function wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  it('actualiza preparación e invalida detalle y listado', async () => {
    const supabase = {}
    vi.mocked(createClient).mockReturnValue(supabase as ReturnType<typeof createClient>)
    vi.mocked(updateRecipePreparation).mockResolvedValue({
      id: recipeId,
      hotel_id: hotelId,
      name: 'Fondo de pescado',
      description: null,
      category: 'sauce',
      subcategory: null,
      servings: 8,
      yield_qty: null,
      yield_unit_id: null,
      prep_time_min: null,
      cook_time_min: null,
      rest_time_min: null,
      difficulty: 'medium',
      status: 'draft',
      total_cost: 0,
      cost_per_serving: 0,
      food_cost_pct: 0,
      target_price: null,
      allergens: [],
      dietary_tags: [],
      notes: null,
      image_url: null,
      is_preparation: true,
      output_product_id: productId,
      output_quantity_per_batch: 2,
      created_by: '44444444-4444-4444-8444-444444444444',
      approved_by: null,
      approved_at: null,
      created_at: '2026-04-27T10:00:00.000Z',
      updated_at: '2026-04-27T10:00:00.000Z',
    })

    const { result } = renderHook(() => useUpdateRecipePreparation(hotelId), {
      wrapper,
    })

    await act(async () => {
      await result.current.mutateAsync({
        recipeId,
        input: {
          is_preparation: true,
          output_product_id: productId,
          output_quantity_per_batch: 2,
        },
      })
    })

    expect(updateRecipePreparation).toHaveBeenCalledWith(supabase, hotelId, recipeId, {
      is_preparation: true,
      output_product_id: productId,
      output_quantity_per_batch: 2,
    })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['recipes', 'list'],
    })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['recipes', 'detail', hotelId, recipeId],
    })
  })
})
