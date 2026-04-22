'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { signUpSchema } from '@/features/identity/application/schemas'

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
  const headersList = await headers()
  const origin = headersList.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? ''

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/callback?next=/`,
      data: { full_name: parsed.data.fullName },
    },
  })

  if (error) {
    return { status: 'error', message: error.message }
  }

  return {
    status: 'success',
    message:
      'Cuenta creada. Revisa tu email para confirmar antes de entrar. Si Supabase tiene email confirmation desactivado, ya puedes entrar directamente.',
  }
}
