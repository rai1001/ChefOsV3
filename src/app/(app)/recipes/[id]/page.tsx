import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { getRecipeServer } from '@/features/recipes/server'
import { createClient } from '@/lib/supabase/server'
import { fetchRecipeIngredients } from '@/features/recipes/infrastructure/ingredient-queries'
import { RecipeNotFoundError, RECIPE_CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/features/recipes'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { RecipeStatusBadge } from '@/features/recipes/components/recipe-status-badge'
import { RecipeTransitionButtons } from '@/features/recipes/components/recipe-transition-buttons'
import { IngredientsEditor } from '@/features/recipes/components/ingredients-editor'
import { StepsEditor } from '@/features/recipes/components/steps-editor'
import { isRecipeLocked } from '@/features/recipes'

export const dynamic = 'force-dynamic'

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  let recipe
  let ingredients
  try {
    recipe = await getRecipeServer(activeHotel.hotel_id, id)
    const supabase = await createClient()
    ingredients = await fetchRecipeIngredients(supabase, activeHotel.hotel_id, id)
  } catch (err) {
    if (err instanceof RecipeNotFoundError) notFound()
    throw err
  }

  const locked = isRecipeLocked(recipe.status)

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <p className="kpi-label">
              <Link href="/recipes" className="hover:underline">
                ← Recetas
              </Link>
            </p>
            <h1>{recipe.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <RecipeStatusBadge status={recipe.status} />
              <span className="badge-status neutral">{RECIPE_CATEGORY_LABELS[recipe.category]}</span>
              <span className="badge-status neutral">{DIFFICULTY_LABELS[recipe.difficulty]}</span>
              <span className="badge-status neutral">{recipe.servings} pax</span>
            </div>
          </div>
          <div className="flex gap-2">
            {!locked && (
              <Button asChild variant="secondary" size="sm">
                <Link href={`/recipes/${id}/edit`}>Editar</Link>
              </Button>
            )}
            <Button asChild size="sm">
              <Link href={`/recipes/${id}/escandallo`}>Escandallo live</Link>
            </Button>
          </div>
        </header>

        <section
          className="grid gap-4 rounded-lg border p-6 md:grid-cols-3"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          <div>
            <p className="kpi-label">Coste total</p>
            <p className="font-data text-lg">
              {recipe.total_cost.toLocaleString('es-ES', {
                style: 'currency',
                currency: 'EUR',
              })}
            </p>
          </div>
          <div>
            <p className="kpi-label">€/pax</p>
            <p className="font-data text-lg">
              {recipe.cost_per_serving.toLocaleString('es-ES', {
                style: 'currency',
                currency: 'EUR',
              })}
            </p>
          </div>
          <div>
            <p className="kpi-label">Food cost %</p>
            <p className="font-data text-lg">{recipe.food_cost_pct.toFixed(1)}%</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2>Workflow</h2>
          <RecipeTransitionButtons
            hotelId={activeHotel.hotel_id}
            recipeId={id}
            currentStatus={recipe.status}
            ingredients={ingredients}
          />
        </section>

        <section>
          <Tabs defaultValue="info">
            <TabsList>
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="ingredients">Ingredientes</TabsTrigger>
              <TabsTrigger value="steps">Pasos</TabsTrigger>
              <TabsTrigger value="allergens">Alérgenos</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <div
                className="grid gap-4 rounded-lg border p-6 md:grid-cols-2"
                style={{
                  borderColor: 'var(--color-border)',
                  background: 'var(--color-bg-card)',
                }}
              >
                <div>
                  <p className="kpi-label">Tiempo prep</p>
                  <p className="font-data">{recipe.prep_time_min ?? '—'} min</p>
                </div>
                <div>
                  <p className="kpi-label">Tiempo cocción</p>
                  <p className="font-data">{recipe.cook_time_min ?? '—'} min</p>
                </div>
                <div>
                  <p className="kpi-label">Precio objetivo</p>
                  <p className="font-data">
                    {recipe.target_price != null
                      ? recipe.target_price.toLocaleString('es-ES', {
                          style: 'currency',
                          currency: 'EUR',
                        })
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="kpi-label">Rendimiento base</p>
                  <p className="font-data">{recipe.yield_qty ?? '—'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="kpi-label">Descripción</p>
                  <p className="whitespace-pre-wrap text-[color:var(--color-text-secondary)]">
                    {recipe.description ?? '—'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="kpi-label">Notas</p>
                  <p className="whitespace-pre-wrap text-[color:var(--color-text-secondary)]">
                    {recipe.notes ?? '—'}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ingredients">
              <IngredientsEditor
                hotelId={activeHotel.hotel_id}
                recipeId={id}
                readOnly={locked}
              />
            </TabsContent>

            <TabsContent value="steps">
              <StepsEditor
                hotelId={activeHotel.hotel_id}
                recipeId={id}
                readOnly={locked}
              />
            </TabsContent>

            <TabsContent value="allergens">
              <div
                className="space-y-3 rounded-lg border p-6"
                style={{
                  borderColor: 'var(--color-border)',
                  background: 'var(--color-bg-card)',
                }}
              >
                <div>
                  <p className="kpi-label mb-2">Alérgenos</p>
                  {recipe.allergens.length === 0 ? (
                    <p className="text-sm text-[color:var(--color-text-muted)]">
                      Ninguno declarado.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {recipe.allergens.map((a) => (
                        <span key={a} className="badge-status warning">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <p className="kpi-label mb-2">Dietary tags</p>
                  {recipe.dietary_tags.length === 0 ? (
                    <p className="text-sm text-[color:var(--color-text-muted)]">
                      Ninguno.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {recipe.dietary_tags.map((d) => (
                        <span key={d} className="badge-status info">
                          {d}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </main>
  )
}
