'use client'

import Link from 'next/link'
import { GitBranch } from 'lucide-react'
import type { ProductionSubrecipeChainNode } from '../domain/feasibility'
import type { ProductionSubrecipeProduction } from '../domain/order'

const numberFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 4,
})

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
})

interface Props {
  chain?: ReadonlyArray<ProductionSubrecipeChainNode>
  productions?: ReadonlyArray<ProductionSubrecipeProduction>
}

export function SubrecipeTree({ chain = [], productions = [] }: Props) {
  if (chain.length === 0 && productions.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-[color:var(--color-text-muted)]" aria-hidden="true" />
        <h2>Cascada</h2>
      </div>

      {chain.length > 0 ? (
        <div
          className="overflow-hidden rounded border"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ background: 'var(--color-bg-sidebar)' }}>
                <th className="kpi-label px-3 py-2">Sub-receta</th>
                <th className="kpi-label px-3 py-2">Requerido</th>
                <th className="kpi-label px-3 py-2">Disponible</th>
                <th className="kpi-label px-3 py-2">Producción</th>
              </tr>
            </thead>
            <tbody>
              {chain.map((node) => (
                <tr
                  key={`${node.depth}-${node.parent_recipe_id}-${node.recipe_id}`}
                  className="border-t"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <td className="px-3 py-2">
                    <span
                      className="inline-flex items-center gap-2"
                      style={{ paddingLeft: `${Math.max(node.depth - 1, 0) * 16}px` }}
                    >
                      <span className="badge-status neutral">Nivel {node.depth}</span>
                      <span className="font-code text-xs">{node.recipe_id.slice(0, 8)}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 font-data">
                    {numberFormatter.format(node.required)}
                  </td>
                  <td className="px-3 py-2 font-data">
                    {numberFormatter.format(node.available)}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`badge-status ${node.will_produce ? 'warning' : 'success'}`}>
                      {node.will_produce
                        ? `${numberFormatter.format(node.quantity_to_produce)} en ${numberFormatter.format(node.batches_needed)} batch`
                        : 'Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {productions.length > 0 ? (
        <div
          className="overflow-hidden rounded border"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ background: 'var(--color-bg-sidebar)' }}>
                <th className="kpi-label px-3 py-2">Orden generada</th>
                <th className="kpi-label px-3 py-2">Producto</th>
                <th className="kpi-label px-3 py-2">Cantidad</th>
                <th className="kpi-label px-3 py-2">Coste</th>
              </tr>
            </thead>
            <tbody>
              {productions.map((production) => (
                <tr
                  key={production.production_order_id}
                  className="border-t"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <td className="px-3 py-2">
                    <Link
                      href={`/production/${production.production_order_id}`}
                      className="font-code text-xs underline-offset-4 hover:underline"
                    >
                      {production.production_order_id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    {production.product_name ?? production.product_id.slice(0, 8)}
                  </td>
                  <td className="px-3 py-2 font-data">
                    {numberFormatter.format(production.quantity_produced)}{' '}
                    {production.unit_abbreviation}
                  </td>
                  <td className="px-3 py-2 font-data">
                    {production.total_cost !== null
                      ? currencyFormatter.format(production.total_cost)
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
