import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  useNotificationPreferences,
  useUpsertNotificationPreference,
} from '../application/use-notifications'
import type { NotificationPreferenceMap } from '../domain/types'
import { NotificationPreferencesForm } from './notification-preferences-form'

vi.mock('../application/use-notifications', () => ({
  useNotificationPreferences: vi.fn(),
  useUpsertNotificationPreference: vi.fn(),
}))

const hotelId = '11111111-1111-4111-8111-111111111111'

function successQuery<TData>(data: TData): UseQueryResult<TData, Error> {
  return {
    data,
    dataUpdatedAt: Date.now(),
    error: null,
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    isError: false,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isLoading: false,
    isInitialLoading: false,
    isPending: false,
    isLoadingError: false,
    isPaused: false,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
    isSuccess: true,
    isEnabled: true,
    status: 'success',
    fetchStatus: 'idle',
    refetch: vi.fn(),
    promise: Promise.resolve(data),
  }
}

function idleMutation<TData, TVariables>(
  mutate: UseMutationResult<TData, Error, TVariables>['mutate']
): UseMutationResult<TData, Error, TVariables> {
  return {
    context: undefined,
    data: undefined,
    variables: undefined,
    error: null,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    submittedAt: 0,
    isError: false,
    isIdle: true,
    isPending: false,
    isSuccess: false,
    status: 'idle',
    mutate,
    mutateAsync: vi.fn(),
    reset: vi.fn(),
  }
}

const allEnabledPrefs: NotificationPreferenceMap = {
  compliance: true,
  inventory: true,
  production: true,
  procurement: true,
  system: true,
}

describe('NotificationPreferencesForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra una tarjeta por categoría', () => {
    vi.mocked(useNotificationPreferences).mockReturnValue(successQuery(allEnabledPrefs))
    vi.mocked(useUpsertNotificationPreference).mockReturnValue(idleMutation(vi.fn()))

    render(<NotificationPreferencesForm hotelId={hotelId} />)

    expect(screen.getByText('Cumplimiento APPCC')).toBeInTheDocument()
    expect(screen.getByText('Inventario')).toBeInTheDocument()
    expect(screen.getByText('Producción')).toBeInTheDocument()
    expect(screen.getByText('Compras')).toBeInTheDocument()
    expect(screen.getByText('Sistema')).toBeInTheDocument()
  })

  it('toggle dispara upsert con valor invertido', async () => {
    const mutate = vi.fn()
    vi.mocked(useNotificationPreferences).mockReturnValue(successQuery(allEnabledPrefs))
    vi.mocked(useUpsertNotificationPreference).mockReturnValue(idleMutation(mutate))

    render(<NotificationPreferencesForm hotelId={hotelId} />)

    const buttons = screen.getAllByRole('button', { name: 'Desactivar' })
    await userEvent.click(buttons[0]!) // compliance es la primera categoría

    expect(mutate).toHaveBeenCalledWith({
      hotel_id: hotelId,
      category: 'compliance',
      in_app_enabled: false,
    })
  })

  it('muestra estado de error cuando query falla', () => {
    vi.mocked(useNotificationPreferences).mockReturnValue({
      ...successQuery(undefined as unknown as NotificationPreferenceMap),
      isError: true,
      isSuccess: false,
      data: undefined,
    } as unknown as UseQueryResult<NotificationPreferenceMap, Error>)
    vi.mocked(useUpsertNotificationPreference).mockReturnValue(idleMutation(vi.fn()))

    render(<NotificationPreferencesForm hotelId={hotelId} />)

    expect(
      screen.getByText(/No se pudieron cargar las preferencias/i)
    ).toBeInTheDocument()
  })
})
