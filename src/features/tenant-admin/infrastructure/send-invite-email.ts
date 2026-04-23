import 'server-only'

import { DEFAULT_FROM, getResendClient } from '@/lib/email/client'
import type { Role } from '@/features/identity'

export interface SendInviteEmailInput {
  toEmail: string
  role: Role
  hotelName: string
  tenantName: string
  inviterName: string | null
  inviteUrl: string // ya incluye /invite/[token] + origin
  expiresAt: string
}

export interface SendInviteEmailResult {
  sent: boolean
  reason?: 'no_api_key' | 'resend_error'
  errorMessage?: string
  inviteUrl: string // siempre se devuelve para poder mostrarlo en UI de dev
}

const ROLE_LABELS_ES: Record<Role, string> = {
  superadmin: 'Super Admin',
  direction: 'Dirección',
  admin: 'Administrador',
  head_chef: 'Jefe de cocina',
  sous_chef: 'Segundo de cocina',
  cook: 'Cocinero',
  commercial: 'Comercial',
  procurement: 'Compras',
  warehouse: 'Almacén',
  room: 'Sala',
  reception: 'Recepción',
  operations: 'Operaciones',
  maintenance: 'Mantenimiento',
}

function formatExpiry(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return iso
  }
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function buildHtml(input: SendInviteEmailInput): string {
  const roleLabel = ROLE_LABELS_ES[input.role] ?? input.role
  const inviter = input.inviterName ? `${input.inviterName}` : 'un administrador'
  const expiry = formatExpiry(input.expiresAt)
  return `
<!doctype html>
<html lang="es"><body style="margin:0;font-family:system-ui,Arial,sans-serif;background:#f5f5f5;color:#1a1a1a;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e4;border-radius:8px;padding:32px">
    <h1 style="font-size:20px;margin:0 0 16px">Invitación a ${input.hotelName}</h1>
    <p style="font-size:14px;line-height:1.6">Hola,</p>
    <p style="font-size:14px;line-height:1.6">
      ${inviter} del grupo <strong>${input.tenantName}</strong> te ha invitado a unirte
      al hotel <strong>${input.hotelName}</strong> como <strong>${roleLabel}</strong> en ChefOS.
    </p>
    <p style="text-align:center;margin:28px 0">
      <a href="${input.inviteUrl}"
         style="display:inline-block;padding:12px 24px;background:#1a1a1a;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600">
        Aceptar invitación
      </a>
    </p>
    <p style="font-size:13px;color:#666;line-height:1.6">
      El enlace expira el <strong>${expiry}</strong>. Si no reconoces esta invitación, puedes ignorar este email.
    </p>
    <p style="font-size:12px;color:#999;line-height:1.6;margin-top:24px">
      Si el botón no funciona, copia este enlace en tu navegador:<br/>
      <span style="word-break:break-all;color:#555">${input.inviteUrl}</span>
    </p>
  </div>
  <p style="text-align:center;font-size:11px;color:#999;margin-top:16px">ChefOS · operaciones de cocina para hoteles</p>
</body></html>
  `.trim()
}

function buildText(input: SendInviteEmailInput): string {
  const roleLabel = ROLE_LABELS_ES[input.role] ?? input.role
  const inviter = input.inviterName ?? 'un administrador'
  const expiry = formatExpiry(input.expiresAt)
  return [
    `Hola,`,
    ``,
    `${inviter} del grupo ${input.tenantName} te ha invitado a unirte al hotel ${input.hotelName}`,
    `como ${roleLabel} en ChefOS.`,
    ``,
    `Acepta la invitación en:`,
    input.inviteUrl,
    ``,
    `El enlace expira el ${expiry}. Si no reconoces esta invitación, puedes ignorarla.`,
  ].join('\n')
}

export async function sendInviteEmail(input: SendInviteEmailInput): Promise<SendInviteEmailResult> {
  const resend = getResendClient()
  if (!resend) {
    return { sent: false, reason: 'no_api_key', inviteUrl: input.inviteUrl }
  }

  try {
    const { error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: input.toEmail,
      subject: `Invitación a ${input.hotelName} en ChefOS`,
      html: buildHtml(input),
      text: buildText(input),
    })
    if (error) {
      console.error('[email] Resend error:', error.message)
      return {
        sent: false,
        reason: 'resend_error',
        errorMessage: error.message,
        inviteUrl: input.inviteUrl,
      }
    }
    return { sent: true, inviteUrl: input.inviteUrl }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[email] Resend exception:', msg)
    return { sent: false, reason: 'resend_error', errorMessage: msg, inviteUrl: input.inviteUrl }
  }
}
