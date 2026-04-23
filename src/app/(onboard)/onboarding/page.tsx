import { OnboardingForm } from '@/features/tenant-admin/components/onboarding-form'

export const dynamic = 'force-dynamic'

export default function OnboardingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-6">
        <header className="text-center space-y-2">
          <p className="kpi-label">Bienvenido a ChefOS</p>
          <h1>Crea tu primer hotel</h1>
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            Vamos a configurar tu grupo y tu primer hotel. Te daremos rol de admin para empezar a
            operar.
          </p>
        </header>

        <section
          className="rounded-lg border p-6"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          <OnboardingForm />
        </section>
      </div>
    </main>
  )
}
