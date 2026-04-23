import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('server-only', () => ({}))

import { sendInviteEmail, type SendInviteEmailInput } from './send-invite-email'
import { getResendClient, DEFAULT_FROM } from '@/lib/email/client'

vi.mock('@/lib/email/client', () => ({
  getResendClient: vi.fn(),
  DEFAULT_FROM: 'ChefOS <onboarding@resend.dev>',
}))

const DEFAULT_INPUT: SendInviteEmailInput = {
  toEmail: 'test@example.com',
  role: 'admin',
  hotelName: 'Hotel Test',
  tenantName: 'Tenant Test',
  inviterName: 'John Doe',
  inviteUrl: 'http://localhost:3000/invite/123',
  expiresAt: '2026-05-01T10:00:00Z',
}

describe('sendInviteEmail', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('debe retornar no_api_key si getResendClient devuelve null', async () => {
    vi.mocked(getResendClient).mockReturnValue(null)

    const result = await sendInviteEmail(DEFAULT_INPUT)

    expect(result).toEqual({
      sent: false,
      reason: 'no_api_key',
      inviteUrl: DEFAULT_INPUT.inviteUrl,
    })
  })

  it('debe enviar el email exitosamente', async () => {
    const sendMock = vi.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null })
    const mockResend = { emails: { send: sendMock } }
    vi.mocked(getResendClient).mockReturnValue(mockResend as any)

    const result = await sendInviteEmail(DEFAULT_INPUT)

    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: DEFAULT_FROM,
        to: DEFAULT_INPUT.toEmail,
        subject: `Invitación a ${DEFAULT_INPUT.hotelName} en ChefOS`,
        html: expect.any(String),
        text: expect.any(String),
      })
    )
    expect(result).toEqual({
      sent: true,
      inviteUrl: DEFAULT_INPUT.inviteUrl,
    })
    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })

  it('debe retornar resend_error si resend.emails.send devuelve { error }', async () => {
    const errorMsg = 'Invalid email address'
    const sendMock = vi.fn().mockResolvedValue({ data: null, error: { message: errorMsg } })
    const mockResend = { emails: { send: sendMock } }
    vi.mocked(getResendClient).mockReturnValue(mockResend as any)

    const result = await sendInviteEmail(DEFAULT_INPUT)

    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      sent: false,
      reason: 'resend_error',
      errorMessage: errorMsg,
      inviteUrl: DEFAULT_INPUT.inviteUrl,
    })
    expect(consoleErrorSpy).toHaveBeenCalledWith('[email] Resend error:', errorMsg)
  })

  it('debe capturar excepciones lanzadas por resend y retornar resend_error', async () => {
    const exceptionMsg = 'Network Error'
    const sendMock = vi.fn().mockRejectedValue(new Error(exceptionMsg))
    const mockResend = { emails: { send: sendMock } }
    vi.mocked(getResendClient).mockReturnValue(mockResend as any)

    const result = await sendInviteEmail(DEFAULT_INPUT)

    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      sent: false,
      reason: 'resend_error',
      errorMessage: exceptionMsg,
      inviteUrl: DEFAULT_INPUT.inviteUrl,
    })
    expect(consoleErrorSpy).toHaveBeenCalledWith('[email] Resend exception:', exceptionMsg)
  })
})
