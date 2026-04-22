'use client'

import Link from 'next/link'
import { useRecipes } from '../application/use-recipes'
import type { RecipesFilter } from '../domain/types'
import { RECIPE_CATEGORY_LABELS } from '../domain/invariants'
import { RecipeStatusBadge } from './recipe-status-badge'

export function RecipesList({
  hotelId,
  filter,
}: {
  hotelId: string
  filter?: RecipesFilter
}) {
  const { data, isLoading, error } = useRecipes(hotelId, filter)

  if (isLoading) return <p className="kpi-label">Cargando recetas…</p>
  if (error) return <p className="text-danger">Error: {error.message}</p>
  const items = data ?? []
  if (items.length === 0) {
    return <p className="text-[color:var(--color-text-muted)]">No hay recetas todavía.</p>
  }

  return (
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
            <th className="kpi-label px-3 py-2">Categoría</th>
            <th className="kpi-label px-3 py-2 text-right">Pax</th>
            <th className="kpi-label px-3 py-2 text-right">€/pax</th>
            <th className="kpi-label px-3 py-2 text-right">Food cost %</th>
            <th className="kpi-label px-3 py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr
              key={r.id}
              className="border-t transition-colors hover:bg-[color:var(--color-bg-hover)]"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <td className="px-3 py-2">
                <Link href={`/recipes/${r.id}`} className="underline-offset-4 hover:underline">
                  {r.name}
                </Link>
              </td>
              <td className="px-3 py-2 text-[color:var(--color-text-secondary)]">
                {RECIPE_CATEGORY_LABELS[r.category]}
              </td>
              <td className="px-3 py-2 text-right font-data">{r.servings}</td>
              <td className="px-3 py-2 text-right font-data">
                {r.cost_per_serving.toLocaleString('es-ES', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </td>
              <td className="px-3 py-2 text-right font-data">
                {r.food_cost_pct.toFixed(1)}%
              </td>
              <td className="px-3 py-2">
                <RecipeStatusBadge status={r.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
