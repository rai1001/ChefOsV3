import { render, screen } from '@testing-library/react'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationsCount,
} from '../application/use-notifications'
import type { Notification } from '../domain/types'
import { NotificationBell } from './notification-bell'

vi.mock('../application/use-notifications', () => ({
  useUnreadNotificationsCount: vi.fn(),
  useNotifications: vi.fn(),
  useMarkNotificationRead: vi.fn(),
  useMarkAllNotificationsRead: vi.fn(),
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

function idleMutation<TData, TVariables>(): UseMutationResult<TData, Error, TVariables> {
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
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    reset: vi.fn(),
  }
}

const sampleNotification: Notification = {
  id: '99999999-9999-4999-8999-999999999999',
  hotel_id: hotelId,
  user_id: '88888888-8888-4888-8888-888888888888',
  event_id: '77777777-7777-4777-8777-777777777777',
  category: 'compliance',
  event_type: 'temperature.out_of_range',
  severity: 'critical',
  title: 'Temperatura fuera de rango',
  body: 'Equipo EQ-1 registró 12°C',
  payload: {},
  link: '/compliance/temperature',
  read_at: null,
  created_at: new Date(Date.now() - 5 * 60_000).toISOString(),
}

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useMarkNotificationRead).mockReturnValue(idleMutation())
    vi.mocked(useMarkAllNotificationsRead).mockReturnValue(idleMutation())
  })

  it('muestra el badge con el unread count', () => {
    vi.mocked(useUnreadNotificationsCount).mockReturnValue(successQuery(3))
    vi.mocked(useNotifications).mockReturnValue(successQuery([sampleNotification]))

    render(<NotificationBell hotelId={hotelId} />)

    const trigger = screen.getByRole('button', { name: /notificaciones/i })
    expect(trigger).toBeInTheDocument()
    expect(screen.getByLabelText('3 sin leer')).toHaveTextContent('3')
  })

  it('clamp visual a 99+ cuando unreadCount > 99', () => {
    vi.mocked(useUnreadNotificationsCount).mockReturnValue(successQuery(125))
    vi.mocked(useNotifications).mockReturnValue(successQuery([]))

    render(<NotificationBell hotelId={hotelId} />)

    expect(screen.getByLabelText('125 sin leer')).toHaveTextContent('99+')
  })

  it('no renderiza badge cuando unreadCount es 0', () => {
    vi.mocked(useUnreadNotificationsCount).mockReturnValue(successQuery(0))
    vi.mocked(useNotifications).mockReturnValue(successQuery([]))

    render(<NotificationBell hotelId={hotelId} />)

    expect(screen.queryByLabelText(/sin leer/i)).not.toBeInTheDocument()
  })
})
