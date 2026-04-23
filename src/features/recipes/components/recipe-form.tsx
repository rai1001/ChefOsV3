'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateRecipe } from '../application/use-create-recipe'
import { useUpdateRecipe } from '../application/use-update-recipe'
import { createRecipeSchema } from '../application/schemas'
import {
  RECIPE_CATEGORIES,
  RECIPE_DIFFICULTIES,
  type Recipe,
  type RecipeCategory,
  type RecipeDifficulty,
} from '../domain/types'
import { DIFFICULTY_LABELS, RECIPE_CATEGORY_LABELS } from '../domain/invariants'
import { parseCommaSeparatedList } from '@/lib/utils'

interface Props {
  hotelId: string
  userId: string
  recipe?: Recipe
}

export function RecipeForm({ hotelId, userId, recipe }: Props) {
  const router = useRouter()
  const create = useCreateRecipe(hotelId, userId)
  const update = useUpdateRecipe(hotelId)
  const isEdit = !!recipe

  const [category, setCategory] = useState<RecipeCategory>(recipe?.category ?? 'main')
  const [difficulty, setDifficulty] = useState<RecipeDifficulty>(recipe?.difficulty ?? 'medium')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const pending = create.isPending || update.isPending

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})
    setFormError(null)
    const data = new FormData(e.currentTarget)
    const raw = {
      name: data.get('name'),
      category,
      servings: data.get('servings'),
      description: (data.get('description') as string) || null,
      prep_time_min: (data.get('prep_time_min') as string) || null,
      cook_time_min: (data.get('cook_time_min') as string) || null,
      difficulty,
      target_price: (data.get('target_price') as string) || null,
      notes: (data.get('notes') as string) || null,
      allergens: parseCommaSeparatedList(data.get('allergens') as string),
      dietary_tags: parseCommaSeparatedList(data.get('dietary_tags') as string),
    }

    const parsed = createRecipeSchema.safeParse(raw)
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors)
      return
    }

    try {
      if (isEdit && recipe) {
        await update.mutateAsync({ recipeId: recipe.id, input: parsed.data })
        router.push(`/recipes/${recipe.id}`)
      } else {
        const created = await create.mutateAsync(parsed.data)
        router.push(`/recipes/${created.id}`)
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error guardando receta')
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" required autoFocus defaultValue={recipe?.name} />
          {fieldErrors.name && <p className="text-xs text-danger">{fieldErrors.name[0]}</p>}
        </div>

        <div className="space-y-1">
          <Label>Categoría</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as RecipeCategory)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RECIPE_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {RECIPE_CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Dificultad</Label>
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v as RecipeDifficulty)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RECIPE_DIFFICULTIES.map((d) => (
                <SelectItem key={d} value={d}>
                  {DIFFICULTY_LABELS[d]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="servings">Pax (servings)</Label>
          <Input
            id="servings"
            name="servings"
            type="number"
            min={1}
            required
            defaultValue={recipe?.servings ?? 4}
          />
          {fieldErrors.servings && <p className="text-xs text-danger">{fieldErrors.servings[0]}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="target_price">Precio objetivo (€)</Label>
          <Input
            id="target_price"
            name="target_price"
            type="number"
            step="0.01"
            defaultValue={recipe?.target_price ?? ''}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="prep_time_min">Tiempo prep (min)</Label>
          <Input
            id="prep_time_min"
            name="prep_time_min"
            type="number"
            min={0}
            defaultValue={recipe?.prep_time_min ?? ''}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="cook_time_min">Tiempo cocción (min)</Label>
          <Input
            id="cook_time_min"
            name="cook_time_min"
            type="number"
            min={0}
            defaultValue={recipe?.cook_time_min ?? ''}
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={recipe?.description ?? ''}
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="allergens">Alérgenos (separados por comas)</Label>
          <Input
            id="allergens"
            name="allergens"
            defaultValue={recipe?.allergens.join(', ') ?? ''}
            placeholder="gluten, dairy, nuts"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="dietary_tags">Dietary tags (separados por comas)</Label>
          <Input
            id="dietary_tags"
            name="dietary_tags"
            defaultValue={recipe?.dietary_tags.join(', ') ?? ''}
            placeholder="vegetariano, sin-gluten"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="notes">Notas / elaboración (resumen)</Label>
          <Textarea id="notes" name="notes" rows={3} defaultValue={recipe?.notes ?? ''} />
        </div>
      </div>

      {formError && (
        <div
          className="rounded border p-3 text-sm"
          style={{
            borderColor: 'var(--urgent-border)',
            background: 'var(--urgent-bg)',
            color: 'var(--color-danger-fg)',
          }}
        >
          {formError}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear receta'}
        </Button>
      </div>
    </form>
  )
}
