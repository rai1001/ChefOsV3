'use server'

import { createClient } from '@/lib/supabase/server'
import { signUpSchema } from '@/features/identity/application/schemas'
import { mapAuthError } from '@/features/identity/domain/auth-errors'
import { logger, newCorrelationId } from '@/lib/logger'
import { getCanonicalAppUrl } from '@/lib/app-url'

const NEUTRAL_SUCCESS_MESSAGE =
  'Cuenta creada. Revisa tu email para confirmar antes de entrar. Si Supabase tiene email confirmation desactivado, ya puedes entrar directamente.'

export type SignUpFormState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string[]> }

export async function signUpAction(
  _prev: SignUpFormState,
  formData: FormData
): Promise<SignUpFormState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    fullName: formData.get('fullName'),
  })

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Revisa los campos marcados',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const origin = getCanonicalAppUrl()

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/callback?next=/`,
      data: { full_name: parsed.data.fullName },
    },
  })

  if (error) {
    const correlationId = newCorrelationId()
    const mapped = mapAuthError(error, 'signup')
    logger.warn('auth.signUp failed', {
      correlationId,
      flow: 'signup',
      code: mapped.code,
      internalMessage: mapped.internalMessage,
    })
    // Para evitar enumeración: rate_limit y weak_password muestran mensaje específico,
    // el resto cae al neutral success (no revela si email ya existía).
    if (mapped.code === 'rate_limited' || mapped.code === 'weak_password') {
      return { status: 'error', message: mapped.userMessage }
    }
    return { status: 'success', message: NEUTRAL_SUCCESS_MESSAGE }
  }

  return {
    status: 'success',
    message: NEUTRAL_SUCCESS_MESSAGE,
  }
}
