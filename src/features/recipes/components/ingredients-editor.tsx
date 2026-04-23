'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useAddRecipeIngredient,
  useRecipeIngredients,
  useRemoveRecipeIngredient,
} from '../application/use-recipe-ingredients'
import { unmappedIngredients } from '../domain/invariants'

interface Props {
  hotelId: string
  recipeId: string
  readOnly?: boolean
}

export function IngredientsEditor({ hotelId, recipeId, readOnly = false }: Props) {
  const ingredientsQ = useRecipeIngredients(hotelId, recipeId)
  const add = useAddRecipeIngredient(hotelId)
  const remove = useRemoveRecipeIngredient(hotelId, recipeId)

  const [name, setName] = useState('')
  const [qty, setQty] = useState('')
  const [waste, setWaste] = useState('0')
  const [unitCost, setUnitCost] = useState('')
  const [error, setError] = useState<string | null>(null)

  const items = ingredientsQ.data ?? []
  const unmapped = unmappedIngredients(items)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    try {
      await add.mutateAsync({
        recipe_id: recipeId,
        ingredient_name: name.trim(),
        quantity_gross: Number(qty),
        waste_pct: Number(waste) || 0,
        unit_cost: Number(unitCost) || 0,
        sort_order: items.length,
      })
      setName('')
      setQty('')
      setWaste('0')
      setUnitCost('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error añadiendo ingrediente')
    }
  }

  return (
    <div className="space-y-4">
      {ingredientsQ.isLoading ? (
        <p className="kpi-label">Cargando ingredientes…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-[color:var(--color-text-muted)]">Sin ingredientes todavía.</p>
      ) : (
        <div
          className="overflow-hidden rounded border"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left"
                style={{ background: 'var(--color-bg-sidebar)', color: 'var(--color-text-muted)' }}
              >
                <th className="kpi-label px-3 py-2">Nombre</th>
                <th className="kpi-label px-3 py-2 text-right">Cantidad</th>
                <th className="kpi-label px-3 py-2 text-right">Merma %</th>
                <th className="kpi-label px-3 py-2 text-right">€/ud</th>
                <th className="kpi-label px-3 py-2">Mapeo</th>
                {!readOnly && <th className="kpi-label px-3 py-2" />}
              </tr>
            </thead>
            <tbody>
              {items.map((ing) => (
                <tr
                  key={ing.id}
                  className="border-t"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <td className="px-3 py-2">{ing.ingredient_name}</td>
                  <td className="px-3 py-2 text-right font-data">{ing.quantity_gross}</td>
                  <td className="px-3 py-2 text-right font-data">{ing.waste_pct}</td>
                  <td className="px-3 py-2 text-right font-data">
                    {ing.unit_cost.toLocaleString('es-ES', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`badge-status ${ing.product_id ? 'success' : 'warning'}`}>
                      {ing.product_id ? 'Mapeado' : 'Pendiente'}
                    </span>
                  </td>
                  {!readOnly && (
                    <td className="px-3 py-2 text-right">
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={remove.isPending}
                        onClick={() => remove.mutate(ing.id)}
                      >
                        Quitar
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {unmapped.length > 0 && (
        <div
          className="rounded border p-3 text-sm"
          style={{
            borderColor: 'var(--warning-border)',
            background: 'var(--warning-bg)',
            color: 'var(--color-warning-fg)',
          }}
        >
          {unmapped.length} ingrediente{unmapped.length > 1 ? 's' : ''} pendiente de mapear a
          producto. Necesarios antes de aprobar.
        </div>
      )}

      {!readOnly && (
        <form
          onSubmit={submit}
          className="grid gap-3 md:grid-cols-5 items-end rounded border p-3"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
        >
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="ing_name">Nombre del ingrediente</Label>
            <Input
              id="ing_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Tomate, aceite oliva…"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ing_qty">Cantidad</Label>
            <Input
              id="ing_qty"
              type="number"
              step="0.01"
              min="0"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ing_waste">Merma %</Label>
            <Input
              id="ing_waste"
              type="number"
              step="1"
              min="0"
              max="100"
              value={waste}
              onChange={(e) => setWaste(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ing_cost">€/ud</Label>
            <Input
              id="ing_cost"
              type="number"
              step="0.001"
              min="0"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
            />
          </div>
          <div className="md:col-span-5 flex justify-end">
            <Button type="submit" size="sm" disabled={add.isPending}>
              {add.isPending ? 'Añadiendo…' : 'Añadir ingrediente'}
            </Button>
          </div>
          {error && <div className="md:col-span-5 text-xs text-danger">{error}</div>}
        </form>
      )}
    </div>
  )
}
