'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRecipes } from '@/features/recipes'
import { useActiveHotel } from '@/features/identity'
import {
  useAddRecipeToSection,
  useRemoveRecipeFromSection,
  useSectionRecipes,
} from '../application/use-section-recipes'

interface Props {
  hotelId: string
  sectionId: string
}

export function MenuSectionRecipesPanel({ hotelId, sectionId }: Props) {
  const hotelQ = useActiveHotel()
  const activeHotelId = hotelQ.data?.hotel_id ?? hotelId
  const recipesQ = useRecipes(activeHotelId, { status: 'approved' })
  const sectionRecipesQ = useSectionRecipes(hotelId, sectionId)
  const add = useAddRecipeToSection(hotelId)
  const remove = useRemoveRecipeFromSection(hotelId, sectionId)

  const [selectedRecipe, setSelectedRecipe] = useState<string>('')
  const [price, setPrice] = useState('')
  const [error, setError] = useState<string | null>(null)

  const approvedRecipes = recipesQ.data?.rows ?? []
  const existing = sectionRecipesQ.data ?? []

  const addRecipe = async () => {
    if (!selectedRecipe) return
    setError(null)
    try {
      await add.mutateAsync({
        section_id: sectionId,
        recipe_id: selectedRecipe,
        price: price ? Number(price) : null,
        sort_order: existing.length,
      })
      setSelectedRecipe('')
      setPrice('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error añadiendo receta')
    }
  }

  return (
    <div className="space-y-3">
      {existing.length === 0 ? (
        <p className="text-xs text-[color:var(--color-text-muted)]">Sin recetas en esta sección.</p>
      ) : (
        <ul className="space-y-1">
          {existing.map((sr) => {
            const recipe = approvedRecipes.find((r) => r.id === sr.recipe_id)
            return (
              <li
                key={sr.id}
                className="flex items-center justify-between gap-2 rounded border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <span>{recipe?.name ?? `(receta ${sr.recipe_id})`}</span>
                <span className="flex items-center gap-3">
                  {sr.price != null && (
                    <span className="font-data text-xs">
                      {sr.price.toLocaleString('es-ES', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(sr.id)}
                  >
                    ×
                  </Button>
                </span>
              </li>
            )
          })}
        </ul>
      )}

      <div className="flex items-end gap-2">
        <div className="space-y-1 flex-1">
          <Label className="text-[11px]">Añadir receta aprobada</Label>
          <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
            <SelectTrigger>
              <SelectValue
                placeholder={
                  approvedRecipes.length === 0 ? 'Sin recetas aprobadas' : 'Seleccionar…'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {approvedRecipes.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 w-28">
          <Label className="text-[11px]">Precio (€)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <Button size="sm" disabled={!selectedRecipe || add.isPending} onClick={addRecipe}>
          Añadir
        </Button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
