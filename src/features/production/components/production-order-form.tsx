'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChefHat, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useRecipes } from '@/features/recipes'
import { useCreateProductionOrder } from '../application/use-create-production-order'
import { useScaleRecipe } from '../application/use-scale-recipe'

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
})

const numberFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 4,
})

export function ProductionOrderForm({ hotelId }: { hotelId: string }) {
  const router = useRouter()
  const [recipeSearch, setRecipeSearch] = useState('')
  const [recipeId, setRecipeId] = useState('')
  const [servings, setServings] = useState(80)
  const [scheduledAt, setScheduledAt] = useState('')
  const [notes, setNotes] = useState('')

  const recipes = useRecipes(
    hotelId,
    { status: ['draft', 'review_pending', 'approved'] },
    { pageSize: 200 }
  )
  const recipeRows = recipes.data?.rows ?? []
  const selectedRecipe = recipeRows.find((recipe) => recipe.id === recipeId)
  const preview = useScaleRecipe(hotelId, recipeId || undefined, servings)
  const createOrder = useCreateProductionOrder()

  const previewRows = useMemo(() => preview.data ?? [], [preview.data])
  const totalEstimatedCost = useMemo(
    () =>
      previewRows.reduce(
        (sum, line) => sum + line.quantity_required * line.estimated_unit_cost,
        0
      ),
    [previewRows]
  )

  const handleRecipeSearch = (value: string) => {
    setRecipeSearch(value)
    const recipe = recipeRows.find((candidate) => candidate.name === value)
    setRecipeId(recipe?.id ?? '')
  }

  const submit = async () => {
    const result = await createOrder.mutateAsync({
      hotel_id: hotelId,
      recipe_id: recipeId,
      servings,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      notes: notes.trim() || null,
    })
    router.push(`/production/${result.order_id}`)
  }

  const canSubmit = recipeId && servings > 0 && !createOrder.isPending

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
      <section
        className="rounded border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <div className="mb-4 flex items-center gap-2">
          <ChefHat className="h-5 w-5" aria-hidden="true" />
          <h2>Nueva orden</h2>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="kpi-label mb-1 block">Receta</span>
            <Input
              list="production-recipes"
              value={recipeSearch}
              onChange={(event) => handleRecipeSearch(event.target.value)}
              placeholder="Buscar receta"
            />
            <datalist id="production-recipes">
              {recipeRows.map((recipe) => (
                <option key={recipe.id} value={recipe.name} />
              ))}
            </datalist>
          </label>

          <label className="block">
            <span className="kpi-label mb-1 block">Raciones</span>
            <Input
              type="number"
              min={1}
              step="0.0001"
              value={servings}
              onChange={(event) => setServings(Number(event.target.value))}
            />
          </label>

          <label className="block">
            <span className="kpi-label mb-1 block">Programada</span>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="kpi-label mb-1 block">Notas</span>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
            />
          </label>

          <Button type="button" disabled={!canSubmit} onClick={submit}>
            <Save className="h-4 w-4" aria-hidden="true" />
            Crear
          </Button>

          {recipes.error ? <p className="text-sm text-danger">{recipes.error.message}</p> : null}
          {preview.error ? <p className="text-sm text-danger">{preview.error.message}</p> : null}
          {createOrder.error ? (
            <p className="text-sm text-danger">{createOrder.error.message}</p>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="kpi-label">Vista previa</p>
            <h2>{selectedRecipe?.name ?? 'Selecciona receta'}</h2>
          </div>
          <p className="font-data text-xl">
            {currencyFormatter.format(totalEstimatedCost)}
          </p>
        </div>

        {preview.isLoading ? <p className="kpi-label">Calculando...</p> : null}

        {previewRows.length > 0 ? (
          <div
            className="overflow-hidden rounded border"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-left"
                  style={{
                    background: 'var(--color-bg-sidebar)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <th className="kpi-label px-3 py-2">Producto</th>
                  <th className="kpi-label px-3 py-2">Cantidad</th>
                  <th className="kpi-label px-3 py-2">Coste unitario</th>
                  <th className="kpi-label px-3 py-2">Coste línea</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((line) => (
                  <tr
                    key={line.product_id}
                    className="border-t"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <td className="px-3 py-2 font-code text-xs">
                      {line.product_id.slice(0, 8)}
                    </td>
                    <td className="px-3 py-2 font-data">
                      {numberFormatter.format(line.quantity_required)}
                    </td>
                    <td className="px-3 py-2 font-data">
                      {currencyFormatter.format(line.estimated_unit_cost)}
                    </td>
                    <td className="px-3 py-2 font-data">
                      {currencyFormatter.format(
                        line.quantity_required * line.estimated_unit_cost
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  )
}
