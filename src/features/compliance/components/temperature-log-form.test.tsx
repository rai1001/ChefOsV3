import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useEquipmentList } from '../application/use-equipment-list'
import { useLogEquipmentTemperature } from '../application/use-temperature-log'
import { TemperatureLogForm } from './temperature-log-form'

vi.mock('../application/use-equipment-list', () => ({
  useEquipmentList: vi.fn(),
}))

vi.mock('../application/use-temperature-log', () => ({
  useLogEquipmentTemperature: vi.fn(),
}))

const hotelId = '11111111-1111-4111-8111-111111111111'
const equipmentId = '22222222-2222-4222-8222-222222222222'

describe('TemperatureLogForm', () => {
  const mutateAsync = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useEquipmentList).mockReturnValue({
      data: [
        {
          id: equipmentId,
          hotel_id: hotelId,
          name: 'Cámara fría',
          equipment_type: 'fridge',
          location: null,
          min_temperature_c: 0,
          max_temperature_c: 5,
          is_active: true,
          created_by: null,
          created_at: '2026-04-27T10:00:00.000Z',
          updated_at: '2026-04-27T10:00:00.000Z',
        },
      ],
      error: null,
      isLoading: false,
    } as ReturnType<typeof useEquipmentList>)
    vi.mocked(useLogEquipmentTemperature).mockReturnValue({
      mutateAsync,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useLogEquipmentTemperature>)
  })

  it('valida que la temperatura sea obligatoria antes de llamar la RPC', async () => {
    render(<TemperatureLogForm hotelId={hotelId} />)

    await userEvent.click(screen.getByRole('button', { name: /registrar/i }))

    expect(await screen.findByText('Temperatura obligatoria')).toBeInTheDocument()
    expect(mutateAsync).not.toHaveBeenCalled()
  })
})
