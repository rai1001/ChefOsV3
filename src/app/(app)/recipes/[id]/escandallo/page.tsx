import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { getRecipeServer } from '@/features/recipes/server'
import { RecipeNotFoundError } from '@/features/recipes'
import { EscandalloLiveView } from '@/features/recipes/components/escandallo-live-view'

export const dynamic = 'force-dynamic'

export default async function EscandalloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  let recipe
  try {
    recipe = await getRecipeServer(activeHotel.hotel_id, id)
  } catch (err) {
    if (err instanceof RecipeNotFoundError) notFound()
    throw err
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href={`/recipes/${id}`} className="hover:underline">
              ← {recipe.name}
            </Link>
          </p>
          <h1>Escandallo live</h1>
          <p className="text-sm text-[color:var(--color-text-secondary)] mt-1">
            Compara el coste snapshot de la receta con los últimos albaranes recibidos para cada
            ingrediente. Se actualiza automáticamente cada 2 minutos.
          </p>
        </header>

        <EscandalloLiveView hotelId={activeHotel.hotel_id} recipeId={id} />
      </div>
    </main>
  )
}
