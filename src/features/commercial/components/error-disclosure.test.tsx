import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useRouter } from 'next/navigation'
import { ClientForm } from './client-form'
import { ClientsList } from './clients-list'
import { EventForm } from './event-form'
import { EventsList } from './events-list'
import { useClients, useClientsInfinite } from '../application/use-clients'
import { useCreateClient } from '../application/use-create-client'
import { useCreateEvent } from '../application/use-create-event'
import { useEventsInfinite } from '../application/use-events'
import { useUpdateEvent } from '../application/use-update-event'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

vi.mock('../application/use-clients', () => ({
  useClients: vi.fn(),
  useClientsInfinite: vi.fn(),
}))

vi.mock('../application/use-create-client', () => ({
  useCreateClient: vi.fn(),
}))

vi.mock('../application/use-create-event', () => ({
  useCreateEvent: vi.fn(),
}))

vi.mock('../application/use-update-event', () => ({
  useUpdateEvent: vi.fn(),
}))

vi.mock('../application/use-events', () => ({
  useEventsInfinite: vi.fn(),
}))

describe('commercial components backend error disclosure', () => {
  const router = {
    back: vi.fn(),
    push: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue(router as unknown as ReturnType<typeof useRouter>)
    vi.mocked(useClients).mockReturnValue({
      data: { rows: [], hasMore: false },
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useClients>)
    vi.mocked(useCreateClient).mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    } as unknown as ReturnType<typeof useCreateClient>)
    vi.mocked(useCreateEvent).mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn().mockResolvedValue('event-1'),
    } as unknown as ReturnType<typeof useCreateEvent>)
    vi.mocked(useUpdateEvent).mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    } as unknown as ReturnType<typeof useUpdateEvent>)
  })

  it('no renderiza detalles internos al fallar la lista de clientes', () => {
    vi.mocked(useClientsInfinite).mockReturnValue({
      data: undefined,
      error: new Error('SQLSTATE 42P01: relation v3_clients does not exist'),
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
    } as unknown as ReturnType<typeof useClientsInfinite>)

    render(<ClientsList hotelId="hotel-1" />)

    expect(screen.getByText('No se pudieron cargar los clientes.')).toBeInTheDocument()
    expect(screen.queryByText(/SQLSTATE 42P01/)).not.toBeInTheDocument()
  })

  it('no renderiza detalles internos al fallar la lista de eventos', () => {
    vi.mocked(useEventsInfinite).mockReturnValue({
      data: undefined,
      error: new Error('SQLSTATE XX000: internal rpc failure'),
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
      isLoading: false,
    } as unknown as ReturnType<typeof useEventsInfinite>)

    render(<EventsList hotelId="hotel-1" />)

    expect(screen.getByText('No se pudieron cargar los eventos.')).toBeInTheDocument()
    expect(screen.queryByText(/SQLSTATE XX000/)).not.toBeInTheDocument()
  })

  it('no renderiza detalles internos al fallar la creacion de cliente', async () => {
    const user = userEvent.setup()
    vi.mocked(useCreateClient).mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn().mockRejectedValue(new Error('duplicate key value violates unique constraint')),
    } as unknown as ReturnType<typeof useCreateClient>)

    render(<ClientForm hotelId="hotel-1" />)

    await user.type(screen.getByLabelText('Nombre'), 'Cliente Demo')
    await user.click(screen.getByRole('button', { name: 'Crear cliente' }))

    expect(await screen.findByText('No se pudo crear el cliente. Inténtalo de nuevo.')).toBeInTheDocument()
    expect(screen.queryByText(/duplicate key value/)).not.toBeInTheDocument()
  })

  it('no renderiza detalles internos al fallar la creacion de evento', async () => {
    const user = userEvent.setup()
    vi.mocked(useCreateEvent).mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn().mockRejectedValue(new Error('permission denied for table v3_events')),
    } as unknown as ReturnType<typeof useCreateEvent>)

    render(<EventForm hotelId="hotel-1" />)

    await user.type(screen.getByLabelText('Nombre del evento'), 'Evento Demo')
    await user.type(screen.getByLabelText('Fecha'), '2026-05-10')
    await user.type(screen.getByLabelText('Invitados (pax)'), '12')
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))

    await waitFor(() => {
      expect(screen.getByText('No se pudo guardar el evento. Inténtalo de nuevo.')).toBeInTheDocument()
    })
    expect(screen.queryByText(/permission denied/)).not.toBeInTheDocument()
  })
})
