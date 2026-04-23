import Link from 'next/link'
import { getActiveHotelOrNull, getCurrentUserOrNull } from '@/features/identity/server'
import { RecipeForm } from '@/features/recipes/components/recipe-form'

export const dynamic = 'force-dynamic'

export default async function NewRecipePage() {
  const [user, activeHotel] = await Promise.all([getCurrentUserOrNull(), getActiveHotelOrNull()])
  if (!user || !activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/recipes" className="hover:underline">
              ← Recetas
            </Link>
          </p>
          <h1>Nueva receta</h1>
        </header>

        <section
          className="rounded-lg border p-6"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          <RecipeForm hotelId={activeHotel.hotel_id} userId={user.id} />
        </section>
      </div>
    </main>
  )
}
