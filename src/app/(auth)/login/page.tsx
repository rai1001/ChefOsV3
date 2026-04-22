'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signInAction, type SignInFormState } from './actions'

const initialState: SignInFormState = { status: 'idle' }

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signInAction, initialState)

  return (
    <>
      <h2 className="mb-4">Entrar</h2>
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
            autoComplete="email"
            autoFocus
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

        <div className="space-y-1">
          <label htmlFor="password" className="kpi-label">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded border px-3 py-2"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-input)',
            }}
          />
          {state.status === 'error' && state.fieldErrors?.password && (
            <p className="text-sm text-danger">{state.fieldErrors.password[0]}</p>
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
          {isPending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <div className="mt-6 space-y-2 text-sm text-center">
        <p>
          <Link
            href="/forgot-password"
            className="text-[color:var(--color-text-secondary)] underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
        <p className="text-[color:var(--color-text-muted)]">
          ¿Sin cuenta?{' '}
          <Link href="/signup" className="underline text-[color:var(--color-text-secondary)]">
            Crear cuenta
          </Link>
        </p>
      </div>
    </>
  )
}
