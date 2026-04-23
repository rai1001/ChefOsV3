import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendInviteEmail, type SendInviteEmailInput } from './send-invite-email'
import { getResendClient } from '@/lib/email/client'

vi.mock('@/lib/email/client', () => ({
  getResendClient: vi.fn(),
  DEFAULT_FROM: 'test@chefos.com',
}))

describe('sendInviteEmail', () => {
  const mockSend = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Configurar el mock de getResendClient para devolver nuestro mockSend
    vi.mocked(getResendClient).mockReturnValue({
      emails: {
        send: mockSend,
      },
    } as unknown as ReturnType<typeof getResendClient>)
  })

  const baseInput: SendInviteEmailInput = {
    toEmail: 'test@example.com',
    role: 'cook',
    hotelName: 'Hotel de Prueba',
    tenantName: 'Grupo Prueba',
    inviterName: 'Admin Juan',
    inviteUrl: 'https://chefos.com/invite/12345',
    expiresAt: '2023-12-31T23:59:59.000Z', // Valor por defecto
  }

  it('formatea la fecha correctamente si se provee una fecha ISO válida', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'test-id' }, error: null })

    const input = {
      ...baseInput,
      expiresAt: '2023-10-15T12:00:00Z', // 15 de octubre de 2023
    }

    const result = await sendInviteEmail(input)

    expect(result.sent).toBe(true)
    expect(mockSend).toHaveBeenCalledTimes(1)

    const callArgs = mockSend.mock.calls[0]?.[0] as { text: string; html: string }

    // Verificamos que el texto y html incluyan "15 de octubre de 2023"
    expect(callArgs?.text).toContain('15 de octubre de 2023')
    expect(callArgs?.html).toContain('15 de octubre de 2023')
  })

  it('usa el valor original como fallback si se provee una fecha inválida', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'test-id' }, error: null })

    const input = {
      ...baseInput,
      expiresAt: 'una-fecha-muy-invalida',
    }

    const result = await sendInviteEmail(input)

    expect(result.sent).toBe(true)
    expect(mockSend).toHaveBeenCalledTimes(1)

    const callArgs = mockSend.mock.calls[0]?.[0] as { text: string; html: string }

    // Verificamos que el texto y html incluyan el string original de fallback
    expect(callArgs?.text).toContain('una-fecha-muy-invalida')
    expect(callArgs?.html).toContain('una-fecha-muy-invalida')

    // Verificamos que no contenga "Invalid Date"
    expect(callArgs?.text).not.toContain('Invalid Date')
    expect(callArgs?.html).not.toContain('Invalid Date')
  })
})
