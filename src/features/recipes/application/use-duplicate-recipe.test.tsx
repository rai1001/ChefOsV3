import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDuplicateRecipe } from './use-duplicate-recipe'
import { createClient } from '@/lib/supabase/client'
import { duplicateRecipe } from '../infrastructure/recipe-queries'

// Mocks
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

vi.mock('../infrastructure/recipe-queries', () => ({
  duplicateRecipe: vi.fn(),
}))

describe('useDuplicateRecipe', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    })

    // Espiamos el invalidateQueries explícitamente
    vi.spyOn(queryClient, 'invalidateQueries')
  })

  function createWrapper() {
    return function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    }
  }

  it('Happy path: duplica la receta, devuelve el nuevo ID y limpia la caché', async () => {
    const mockSupabaseClient = {}
    ;(createClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabaseClient)
    ;(duplicateRecipe as ReturnType<typeof vi.fn>).mockResolvedValue('new-recipe-id')

    const hotelId = 'hotel-123'
    const { result } = renderHook(() => useDuplicateRecipe(hotelId), {
      wrapper: createWrapper(),
    })

    const recipeIdToDuplicate = 'old-recipe-id'

    let resolvedId: string | undefined
    await act(async () => {
      resolvedId = await result.current.mutateAsync(recipeIdToDuplicate)
    })

    // Verifica que createClient se llama
    expect(createClient).toHaveBeenCalledTimes(1)

    // Verifica que duplicateRecipe recibe los parámetros correctos
    expect(duplicateRecipe).toHaveBeenCalledTimes(1)
    expect(duplicateRecipe).toHaveBeenCalledWith(mockSupabaseClient, hotelId, recipeIdToDuplicate)

    // Verifica que la mutación resuelve con el string esperado
    expect(resolvedId).toBe('new-recipe-id')

    // Verifica que se invalida la caché
    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(1)
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['recipes', 'list'] })
  })

  it('Error cuando falta hotelId: no llama a dependencias ni limpia caché', async () => {
    const { result } = renderHook(() => useDuplicateRecipe(undefined), {
      wrapper: createWrapper(),
    })

    const recipeIdToDuplicate = 'old-recipe-id'

    await act(async () => {
      await expect(result.current.mutateAsync(recipeIdToDuplicate)).rejects.toThrowError('hotelId requerido')
    })

    // Verifica que no se llama a createClient ni a duplicateRecipe
    expect(createClient).not.toHaveBeenCalled()
    expect(duplicateRecipe).not.toHaveBeenCalled()

    // Verifica que no hay invalidación de caché
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled()
  })

  it('Error propagado desde duplicateRecipe: el error sube y no limpia caché', async () => {
    const mockSupabaseClient = {}
    ;(createClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabaseClient)

    const dbError = new Error('Error en base de datos')
    ;(duplicateRecipe as ReturnType<typeof vi.fn>).mockRejectedValue(dbError)

    const hotelId = 'hotel-123'
    const { result } = renderHook(() => useDuplicateRecipe(hotelId), {
      wrapper: createWrapper(),
    })

    const recipeIdToDuplicate = 'old-recipe-id'

    await act(async () => {
      await expect(result.current.mutateAsync(recipeIdToDuplicate)).rejects.toThrowError('Error en base de datos')
    })

    // Verifica que las dependencias fueron llamadas
    expect(createClient).toHaveBeenCalledTimes(1)
    expect(duplicateRecipe).toHaveBeenCalledTimes(1)

    // Verifica que no hay invalidación de caché en fallo
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled()
  })
})
