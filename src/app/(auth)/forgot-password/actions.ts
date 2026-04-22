'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { forgotPasswordSchema } from '@/features/identity/application/schemas'

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
  const headersList = await headers()
  const origin = headersList.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? ''

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/callback?next=/reset-password`,
  })

  if (error) {
    return { status: 'error', message: error.message }
  }

  return {
    status: 'success',
    message:
      'Si el email está registrado, recibirás un enlace de recuperación en tu bandeja. Revisa también la carpeta de spam.',
  }
}
