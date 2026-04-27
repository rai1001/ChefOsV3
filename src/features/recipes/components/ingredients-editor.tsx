'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { Package, Workflow } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useProducts, useUnits } from '@/features/catalog'
import {
  useAddRecipeIngredient,
  useRecipeIngredients,
  useRemoveRecipeIngredient,
} from '../application/use-recipe-ingredients'
import { useRecipes } from '../application/use-recipes'
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
  const products = useProducts({ hotelId, activeOnly: true }, { pageSize: 300 })
  const units = useUnits(hotelId)
  const preparations = useRecipes(
    hotelId,
    {
      status: ['draft', 'review_pending', 'approved'],
      isPreparation: true,
    },
    { pageSize: 300 }
  )

  const [mode, setMode] = useState<'product' | 'subrecipe'>('product')
  const [name, setName] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [subrecipeSearch, setSubrecipeSearch] = useState('')
  const [qty, setQty] = useState('')
  const [waste, setWaste] = useState('0')
  const [unitCost, setUnitCost] = useState('')
  const [error, setError] = useState<string | null>(null)

  const items = ingredientsQ.data ?? []
  const unmapped = unmappedIngredients(items)
  const productRows = useMemo(() => products.data?.rows ?? [], [products.data?.rows])
  const preparationRows = useMemo(
    () => preparations.data?.rows ?? [],
    [preparations.data?.rows]
  )
  const unitRows = useMemo(() => units.data ?? [], [units.data])
  const productById = useMemo(
    () => new Map(productRows.map((product) => [product.id, product])),
    [productRows]
  )
  const unitById = useMemo(
    () => new Map(unitRows.map((unit) => [unit.id, unit])),
    [unitRows]
  )
  const selectedProduct = productRows.find(
    (product) => product.name === productSearch || product.id === productSearch
  )
  const selectedPreparation = preparationRows.find(
    (recipe) => recipe.name === subrecipeSearch || recipe.id === subrecipeSearch
  )

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    try {
      let ingredientName = name.trim()
      let productId: string | null = null
      let sourceRecipeId: string | null = null
      let unitId: string | null = null

      if (mode === 'product' && selectedProduct) {
        productId = selectedProduct.id
        unitId = selectedProduct.default_unit_id
        if (!unitId) throw new Error('El producto seleccionado no tiene unidad por defecto')
        if (!ingredientName) ingredientName = selectedProduct.name
      }

      if (mode === 'subrecipe') {
        if (!selectedPreparation) throw new Error('Selecciona una sub-receta')
        if (!selectedPreparation.output_product_id) {
          throw new Error('La sub-receta no tiene producto de salida')
        }
        const outputProduct = productById.get(selectedPreparation.output_product_id)
        if (!outputProduct?.default_unit_id) {
          throw new Error('El producto de salida no tiene unidad por defecto')
        }
        sourceRecipeId = selectedPreparation.id
        productId = selectedPreparation.output_product_id
        unitId = outputProduct.default_unit_id
        if (!ingredientName) ingredientName = selectedPreparation.name
      }

      if (!ingredientName) throw new Error('Nombre del ingrediente requerido')

      await add.mutateAsync({
        recipe_id: recipeId,
        ingredient_name: ingredientName,
        product_id: productId,
        source_recipe_id: sourceRecipeId,
        unit_id: unitId,
        quantity_gross: Number(qty),
        waste_pct: Number(waste) || 0,
        unit_cost: Number(unitCost) || 0,
        sort_order: items.length,
      })
      setName('')
      setProductSearch('')
      setSubrecipeSearch('')
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
        <p className="text-sm text-[color:var(--color-text-muted)]">
          Sin ingredientes todavía.
        </p>
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
                  <th className="kpi-label px-3 py-2">Origen</th>
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
                    <span
                      className={`badge-status ${ing.product_id && ing.unit_id ? 'success' : 'warning'}`}
                    >
                      {ing.product_id && ing.unit_id ? 'Mapeado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`badge-status ${ing.source_recipe_id ? 'info' : 'neutral'}`}>
                      {ing.source_recipe_id ? 'Sub-receta' : 'Producto'}
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
          className="grid gap-3 md:grid-cols-6 items-end rounded border p-3"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
        >
          <div className="md:col-span-6 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={mode === 'product' ? 'primary' : 'secondary'}
              onClick={() => setMode('product')}
            >
              <Package className="h-4 w-4" aria-hidden="true" />
              Producto
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === 'subrecipe' ? 'primary' : 'secondary'}
              onClick={() => setMode('subrecipe')}
            >
              <Workflow className="h-4 w-4" aria-hidden="true" />
              Sub-receta
            </Button>
          </div>

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

          {mode === 'product' ? (
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="ing_product">Producto</Label>
              <Input
                id="ing_product"
                list="ingredient-products"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Buscar producto"
              />
              <datalist id="ingredient-products">
                {productRows.map((product) => (
                  <option key={product.id} value={product.name} />
                ))}
              </datalist>
            </div>
          ) : (
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="ing_subrecipe">Sub-receta</Label>
              <Input
                id="ing_subrecipe"
                list="ingredient-subrecipes"
                value={subrecipeSearch}
                onChange={(e) => setSubrecipeSearch(e.target.value)}
                required
                placeholder="Buscar preparación"
              />
              <datalist id="ingredient-subrecipes">
                {preparationRows
                  .filter((recipe) => recipe.id !== recipeId)
                  .map((recipe) => (
                    <option key={recipe.id} value={recipe.name} />
                  ))}
              </datalist>
            </div>
          )}

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
          <div className="space-y-1">
            <Label>Unidad</Label>
            <p className="flex h-10 items-center rounded border px-3 text-sm text-[color:var(--color-text-secondary)]"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {mode === 'subrecipe'
                ? unitById.get(productById.get(selectedPreparation?.output_product_id ?? '')?.default_unit_id ?? '')?.abbreviation ?? '-'
                : unitById.get(selectedProduct?.default_unit_id ?? '')?.abbreviation ?? '-'}
            </p>
          </div>
          <div className="md:col-span-6 flex justify-end">
            <Button type="submit" size="sm" disabled={add.isPending}>
              {add.isPending ? 'Añadiendo…' : 'Añadir ingrediente'}
            </Button>
          </div>
          {error && (
            <div className="md:col-span-6 text-xs text-danger">{error}</div>
          )}
        </form>
      )}
    </div>
  )
}
