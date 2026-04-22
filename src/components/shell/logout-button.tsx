'use client'

import { useSignOut } from '@/features/identity'

export function LogoutButton() {
  const signOut = useSignOut()

  return (
    <button
      type="button"
      onClick={() => signOut.mutate()}
      disabled={signOut.isPending}
      className="rounded px-4 py-2 text-sm border disabled:opacity-60"
      style={{
        borderColor: 'var(--color-border)',
        background: 'var(--color-bg-card)',
      }}
    >
      {signOut.isPending ? 'Saliendo…' : 'Salir'}
    </button>
  )
}
