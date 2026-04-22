import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="kpi-label mb-2">ChefOS v3</p>
          <h1 className="text-2xl">Control operativo de cocina</h1>
        </div>
        <div
          className="rounded-lg border p-6"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
