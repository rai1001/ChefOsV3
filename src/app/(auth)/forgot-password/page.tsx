'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { forgotPasswordAction, type ForgotPasswordFormState } from './actions'

const initialState: ForgotPasswordFormState = { status: 'idle' }

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState)

  if (state.status === 'success') {
    return (
      <>
        <h2 className="mb-4">Revisa tu email</h2>
        <div className="alert-box info p-3">
          <p className="text-sm">{state.message}</p>
        </div>
        <p className="mt-6 text-sm text-center">
          <Link href="/login" className="underline text-[color:var(--color-text-secondary)]">
            Volver a login
          </Link>
        </p>
      </>
    )
  }

  return (
    <>
      <h2 className="mb-4">Recuperar contraseña</h2>
      <p className="mb-4 text-sm text-[color:var(--color-text-muted)]">
        Introduce tu email y te enviaremos un enlace para cambiar la contraseña.
      </p>
      <form action={formAction} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="kpi-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoFocus
            autoComplete="email"
            className="w-full rounded border px-3 py-2"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-input)',
            }}
          />
          {state.status === 'error' && state.fieldErrors?.email && (
            <p className="text-sm text-danger">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        {state.status === 'error' && !state.fieldErrors && (
          <div className="alert-box urgent p-3">
            <p className="text-sm">{state.message}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded px-4 py-2 font-medium bg-accent disabled:opacity-60"
        >
          {isPending ? 'Enviando…' : 'Enviar enlace'}
        </button>
      </form>

      <p className="mt-6 text-sm text-center">
        <Link href="/login" className="underline text-[color:var(--color-text-secondary)]">
          Volver a login
        </Link>
      </p>
    </>
  )
}
