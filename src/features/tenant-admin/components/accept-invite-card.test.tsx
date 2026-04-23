import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AcceptInviteCard } from './accept-invite-card'
import { acceptInviteAction } from '../application/accept-invite-action'
import { useRouter } from 'next/navigation'

// Mock de las dependencias externas
vi.mock('../application/accept-invite-action', () => ({
  acceptInviteAction: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

describe('AcceptInviteCard', () => {
  const mockRouter = {
    push: vi.fn(),
    refresh: vi.fn(),
  }

  const defaultProps = {
    token: 'test-token-123',
    callerEmail: 'user@example.com',
    preview: {
      id: 'invite-1',
      tenant_id: 'tenant-1',
      hotel_name: 'Hotel Test',
      tenant_name: 'Tenant Test',
      role: 'admin' as const,
      email: 'user@example.com',
      expires_at: new Date(Date.now() + 86400000).toISOString(), // Mañana
      status: 'pending' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      hotel_id: 'hotel-1',
      accepted_at: null,
      revoked_at: null,
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue(mockRouter as unknown as ReturnType<typeof useRouter>)
  })

  // Aquí irán las pruebas...
  it('renders successfully', () => {
    render(<AcceptInviteCard {...defaultProps} />)
    expect(screen.getByText('Aceptar invitación y entrar')).toBeInTheDocument()
  })
  it('handles successful acceptance', async () => {
    vi.mocked(acceptInviteAction).mockResolvedValueOnce({ hotel_id: '1', tenant_id: '1', role: 'admin' })
    render(<AcceptInviteCard {...defaultProps} />)

    const acceptButton = screen.getByText('Aceptar invitación y entrar')
    await userEvent.click(acceptButton)

    expect(acceptInviteAction).toHaveBeenCalledWith('test-token-123')

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/')
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })

  it('handles error when acceptInviteAction rejects with an Error instance', async () => {
    vi.mocked(acceptInviteAction).mockRejectedValueOnce(new Error('Network failure'))
    render(<AcceptInviteCard {...defaultProps} />)

    const acceptButton = screen.getByText('Aceptar invitación y entrar')
    await userEvent.click(acceptButton)

    expect(acceptInviteAction).toHaveBeenCalledWith('test-token-123')

    await waitFor(() => {
      expect(screen.getByText('Network failure')).toBeInTheDocument()
    })

    expect(mockRouter.push).not.toHaveBeenCalled()
    expect(mockRouter.refresh).not.toHaveBeenCalled()
  })

  it('handles error when acceptInviteAction rejects with a non-Error value', async () => {
    vi.mocked(acceptInviteAction).mockRejectedValueOnce('Some unexpected string error')
    render(<AcceptInviteCard {...defaultProps} />)

    const acceptButton = screen.getByText('Aceptar invitación y entrar')
    await userEvent.click(acceptButton)

    expect(acceptInviteAction).toHaveBeenCalledWith('test-token-123')

    await waitFor(() => {
      expect(screen.getByText('Error aceptando invitación')).toBeInTheDocument()
    })

    expect(mockRouter.push).not.toHaveBeenCalled()
    expect(mockRouter.refresh).not.toHaveBeenCalled()
  })
})
