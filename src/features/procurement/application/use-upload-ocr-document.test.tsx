import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import React from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  calculateFileSha256,
  uploadOcrDocument,
} from '../infrastructure/storage'
import { useUploadOcrDocument } from './use-upload-ocr-document'

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

vi.mock('../infrastructure/storage', () => ({
  calculateFileSha256: vi.fn(),
  uploadOcrDocument: vi.fn(),
}))

describe('useUploadOcrDocument', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
      },
    })
  })

  function wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  it('calcula sha256 y sube el documento OCR por storage helper', async () => {
    const supabase = {}
    const file = new File(['demo'], 'factura.pdf', { type: 'application/pdf' })
    vi.mocked(createClient).mockReturnValue(supabase as ReturnType<typeof createClient>)
    vi.mocked(calculateFileSha256).mockResolvedValue('b'.repeat(64))
    vi.mocked(uploadOcrDocument).mockResolvedValue({
      storage_path: `hotel-1/${'b'.repeat(64)}.pdf`,
      mime_type: 'application/pdf',
      sha256: 'b'.repeat(64),
    })

    const { result } = renderHook(() => useUploadOcrDocument(), { wrapper })

    let uploaded:
      | Awaited<ReturnType<typeof result.current.mutateAsync>>
      | undefined
    await act(async () => {
      uploaded = await result.current.mutateAsync({ hotelId: 'hotel-1', file })
    })

    expect(calculateFileSha256).toHaveBeenCalledWith(file)
    expect(uploadOcrDocument).toHaveBeenCalledWith(supabase, {
      hotelId: 'hotel-1',
      file,
      sha256: 'b'.repeat(64),
    })
    expect(uploaded?.mime_type).toBe('application/pdf')
  })
})
