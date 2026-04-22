import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { Button } from '@/components/ui/button'
import { RecipesList } from '@/features/recipes/components/recipes-list'

export const dynamic = 'force-dynamic'

export default async function RecipesPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="kpi-label">
              <Link href="/" className="hover:underline">
                ← Dashboard
              </Link>
            </p>
            <h1>Recetas · {activeHotel.hotel_name}</h1>
          </div>
          <Button asChild size="sm">
            <Link href="/recipes/new">Nueva receta</Link>
          </Button>
        </header>

        <RecipesList hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}
