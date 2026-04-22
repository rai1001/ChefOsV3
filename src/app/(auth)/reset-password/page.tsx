'use client'

import { useActionState } from 'react'
import { resetPasswordAction, type ResetPasswordFormState } from './actions'

const initialState: ResetPasswordFormState = { status: 'idle' }

const inputStyle = {
  borderColor: 'var(--color-border)',
  background: 'var(--color-bg-input)',
}

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState)

  return (
    <>
      <h2 className="mb-4">Nueva contraseña</h2>
      <form action={formAction} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="password" className="kpi-label">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
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
            Confirmar
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
          {isPending ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>
    </>
  )
}
