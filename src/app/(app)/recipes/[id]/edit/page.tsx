import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getActiveHotelOrNull, getCurrentUserOrNull } from '@/features/identity/server'
import { getRecipeServer } from '@/features/recipes/server'
import { RecipeNotFoundError } from '@/features/recipes'
import { RecipeForm } from '@/features/recipes/components/recipe-form'

export const dynamic = 'force-dynamic'

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [user, activeHotel] = await Promise.all([getCurrentUserOrNull(), getActiveHotelOrNull()])
  if (!user || !activeHotel) return null

  let recipe
  try {
    recipe = await getRecipeServer(activeHotel.hotel_id, id)
  } catch (err) {
    if (err instanceof RecipeNotFoundError) notFound()
    throw err
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href={`/recipes/${id}`} className="hover:underline">
              ← Volver a receta
            </Link>
          </p>
          <h1>Editar receta</h1>
        </header>

        <section
          className="rounded-lg border p-6"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          <RecipeForm hotelId={activeHotel.hotel_id} userId={user.id} recipe={recipe} />
        </section>
      </div>
    </main>
  )
}
