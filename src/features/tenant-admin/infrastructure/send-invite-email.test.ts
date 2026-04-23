import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockGetResendClient } = vi.hoisted(() => ({
  mockGetResendClient: vi.fn(),
}))

vi.mock('@/lib/email/client', () => ({
  DEFAULT_FROM: 'noreply@chefos.test',
  getResendClient: mockGetResendClient,
}))

import { sendInviteEmail } from './send-invite-email'

const baseInput = {
  toEmail: 'chef@example.com',
  role: 'admin' as const,
  hotelName: 'Hotel Sol',
  tenantName: 'Grupo Sol',
  inviterName: 'Ana',
  inviteUrl: 'https://example.com/invite/token',
  expiresAt: '2026-12-31T23:59:59.000Z',
}

describe('sendInviteEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns no_api_key when resend client is unavailable', async () => {
    mockGetResendClient.mockReturnValue(null)

    await expect(sendInviteEmail(baseInput)).resolves.toEqual({
      sent: false,
      reason: 'no_api_key',
      inviteUrl: baseInput.inviteUrl,
    })
  })

  it('returns resend_error when resend responds with error', async () => {
    const send = vi.fn(async () => ({ error: { message: 'quota exceeded' } }))
    mockGetResendClient.mockReturnValue({ emails: { send } })

    await expect(sendInviteEmail(baseInput)).resolves.toEqual({
      sent: false,
      reason: 'resend_error',
      errorMessage: 'quota exceeded',
      inviteUrl: baseInput.inviteUrl,
    })
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('returns resend_error when resend throws', async () => {
    const send = vi.fn(async () => {
      throw new Error('network down')
    })
    mockGetResendClient.mockReturnValue({ emails: { send } })

    await expect(sendInviteEmail(baseInput)).resolves.toEqual({
      sent: false,
      reason: 'resend_error',
      errorMessage: 'network down',
      inviteUrl: baseInput.inviteUrl,
    })
  })
})
