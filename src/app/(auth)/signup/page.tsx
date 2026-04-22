'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signUpAction, type SignUpFormState } from './actions'

const initialState: SignUpFormState = { status: 'idle' }

const inputStyle = {
  borderColor: 'var(--color-border)',
  background: 'var(--color-bg-input)',
}

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signUpAction, initialState)

  if (state.status === 'success') {
    return (
      <>
        <h2 className="mb-4">Cuenta creada</h2>
        <div className="alert-box success p-3">
          <p className="text-sm">{state.message}</p>
        </div>
        <p className="mt-6 text-sm text-center">
          <Link href="/login" className="underline text-[color:var(--color-text-secondary)]">
            Ir a login
          </Link>
        </p>
      </>
    )
  }

  return (
    <>
      <h2 className="mb-4">Crear cuenta</h2>
      <form action={formAction} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="fullName" className="kpi-label">
            Nombre completo
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            autoFocus
            autoComplete="name"
            className="w-full rounded border px-3 py-2"
            style={inputStyle}
          />
          {state.status === 'error' && state.fieldErrors?.fullName && (
            <p className="text-sm text-danger">{state.fieldErrors.fullName[0]}</p>
          )}
        </div>

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
            className="w-full rounded border px-3 py-2"
            style={inputStyle}
          />
          {state.status === 'error' && state.fieldErrors?.email && (
            <p className="text-sm text-danger">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="kpi-label">
            Contraseña (min 8 chars, letras + números)
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            className="w-full rounded border px-3 py-2"
            style={inputStyle}
          />
          {state.status === 'error' && state.fieldErrors?.password && (
            <p className="text-sm text-danger">{state.fieldErrors.password[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="kpi-label">
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className="w-full rounded border px-3 py-2"
            style={inputStyle}
          />
          {state.status === 'error' && state.fieldErrors?.confirmPassword && (
            <p className="text-sm text-danger">{state.fieldErrors.confirmPassword[0]}</p>
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
          {isPending ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-6 text-sm text-center text-[color:var(--color-text-muted)]">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="underline text-[color:var(--color-text-secondary)]">
          Entrar
        </Link>
      </p>
    </>
  )
}
