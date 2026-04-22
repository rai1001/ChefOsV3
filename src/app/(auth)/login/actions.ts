'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { signInSchema } from '@/features/identity/application/schemas'
import { mapAuthError } from '@/features/identity/domain/auth-errors'
import { logger, newCorrelationId } from '@/lib/logger'

export type SignInFormState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string[]> }

export async function signInAction(
  _prev: SignInFormState,
  formData: FormData
): Promise<SignInFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Revisa los campos marcados',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    const correlationId = newCorrelationId()
    const mapped = mapAuthError(error, 'login')
    logger.warn('auth.signIn failed', {
      correlationId,
      flow: 'login',
      code: mapped.code,
      internalMessage: mapped.internalMessage,
    })
    return { status: 'error', message: mapped.userMessage }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
