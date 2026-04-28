import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AcceptInvitePage from './page'
import { getCurrentUserOrNull } from '@/features/identity/server'
import { previewInviteServer } from '@/features/tenant-admin/server'

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`)
  }),
}))

vi.mock('@/features/identity/server', () => ({
  getCurrentUserOrNull: vi.fn(),
}))

vi.mock('@/features/tenant-admin/server', () => ({
  previewInviteServer: vi.fn(),
}))

vi.mock('@/features/tenant-admin/components/accept-invite-card', () => ({
  AcceptInviteCard: () => <div>Aceptar invitacion</div>,
}))

describe('AcceptInvitePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getCurrentUserOrNull).mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
    } as Awaited<ReturnType<typeof getCurrentUserOrNull>>)
  })

  it('muestra invitacion invalida cuando el token no puede decodificarse', async () => {
    const view = await AcceptInvitePage({
      params: Promise.resolve({ token: '%' }),
    })

    render(view)

    expect(screen.getAllByText('Invitación no válida').length).toBeGreaterThan(0)
    expect(previewInviteServer).not.toHaveBeenCalled()
  })
})
