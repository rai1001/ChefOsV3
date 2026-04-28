import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCleaningAreaList } from '../application/use-cleaning-area-list'
import { useCompleteCleaningCheck } from '../application/use-cleaning-log'
import { CleaningLogChecklist } from './cleaning-log-checklist'

vi.mock('../application/use-cleaning-area-list', () => ({
  useCleaningAreaList: vi.fn(),
}))

vi.mock('../application/use-cleaning-log', () => ({
  useCompleteCleaningCheck: vi.fn(),
}))

const hotelId = '11111111-1111-4111-8111-111111111111'
const areaId = '22222222-2222-4222-8222-222222222222'

describe('CleaningLogChecklist', () => {
  const mutateAsync = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mutateAsync.mockResolvedValue({
      row: {
        id: areaId,
        hotel_id: hotelId,
        area_id: areaId,
        due_date: '2026-04-27',
        completed_at: '2026-04-27T10:00:00.000Z',
        completed_by: areaId,
        notes: null,
        created_at: '2026-04-27T10:00:00.000Z',
        updated_at: '2026-04-27T10:00:00.000Z',
      },
      area_name: 'Cocina fría',
      frequency: 'daily',
    })
    vi.mocked(useCleaningAreaList).mockReturnValue({
      data: [
        {
          id: areaId,
          hotel_id: hotelId,
          name: 'Cocina fría',
          frequency: 'daily',
          description: null,
          is_active: true,
          created_by: null,
          created_at: '2026-04-27T10:00:00.000Z',
          updated_at: '2026-04-27T10:00:00.000Z',
        },
      ],
      error: null,
      isLoading: false,
    } as ReturnType<typeof useCleaningAreaList>)
    vi.mocked(useCompleteCleaningCheck).mockReturnValue({
      mutateAsync,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useCompleteCleaningCheck>)
  })

  it('marca una zona como completada de forma optimista al tocar completar', async () => {
    render(<CleaningLogChecklist hotelId={hotelId} today="2026-04-27" />)

    await userEvent.click(screen.getByRole('button', { name: /completar cocina fría/i }))

    expect(screen.getByText('Completado')).toBeInTheDocument()
    expect(mutateAsync).toHaveBeenCalledWith({
      hotel_id: hotelId,
      area_id: areaId,
      due_date: '2026-04-27',
      notes: null,
    })
  })
})
