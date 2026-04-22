'use server'

import { createClient } from '@/lib/supabase/server'
import { forgotPasswordSchema } from '@/features/identity/application/schemas'
import { mapAuthError } from '@/features/identity/domain/auth-errors'
import { logger, newCorrelationId } from '@/lib/logger'
import { getCanonicalAppUrl } from '@/lib/app-url'

const NEUTRAL_SUCCESS_MESSAGE =
  'Si el email está registrado, recibirás un enlace de recuperación en tu bandeja. Revisa también la carpeta de spam.'

export type ForgotPasswordFormState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string[]> }

export async function forgotPasswordAction(
  _prev: ForgotPasswordFormState,
  formData: FormData
): Promise<ForgotPasswordFormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') })

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Email no válido',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const origin = getCanonicalAppUrl()

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/callback?next=/reset-password`,
  })

  if (error) {
    const correlationId = newCorrelationId()
    const mapped = mapAuthError(error, 'reset')
    logger.warn('auth.forgotPassword failed', {
      correlationId,
      flow: 'reset',
      code: mapped.code,
      internalMessage: mapped.internalMessage,
    })
    // Para evitar enumeración: aún ante error, devolvemos el mensaje neutro de éxito
    // salvo que sea rate_limited (el usuario debe saber que está limitado).
    if (mapped.code === 'rate_limited') {
      return { status: 'error', message: mapped.userMessage }
    }
    return { status: 'success', message: NEUTRAL_SUCCESS_MESSAGE }
  }

  return {
    status: 'success',
    message: NEUTRAL_SUCCESS_MESSAGE,
  }
}
