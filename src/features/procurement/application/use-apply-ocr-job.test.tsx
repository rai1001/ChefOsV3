import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { applyOcrJob } from '../infrastructure/ocr-rpcs'
import { useApplyOcrJob } from './use-apply-ocr-job'

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

vi.mock('../infrastructure/ocr-rpcs', () => ({
  applyOcrJob: vi.fn(),
}))

describe('useApplyOcrJob', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
      },
    })
    vi.spyOn(queryClient, 'invalidateQueries')
  })

  function wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  it('aplica el job OCR e invalida colas, recepciones y escandallos', async () => {
    const supabase = {}
    vi.mocked(createClient).mockReturnValue(supabase as ReturnType<typeof createClient>)
    vi.mocked(applyOcrJob).mockResolvedValue({
      goods_receipt_id: 'gr-1',
      new_po_status: 'received_complete',
      lines_count: 2,
      price_changes_logged: 1,
      synced_recipes: 3,
      idempotent: false,
    })

    const { result } = renderHook(() => useApplyOcrJob(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        hotel_id: 'hotel-1',
        job_id: 'job-1',
      })
    })

    expect(applyOcrJob).toHaveBeenCalledWith(supabase, {
      hotel_id: 'hotel-1',
      job_id: 'job-1',
    })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['procurement', 'ocr-jobs', 'list'],
    })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['procurement', 'ocr-jobs', 'detail', 'job-1'],
    })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['procurement', 'goods-receipts', 'list'],
    })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['escandallos'],
    })
  })
})
