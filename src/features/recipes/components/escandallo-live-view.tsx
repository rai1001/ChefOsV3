'use client'

import { Button } from '@/components/ui/button'
import { useEscandalloLive } from '../application/use-escandallo-live'
import { useSyncEscandalloPrices } from '../application/use-sync-escandallo-prices'
import { priceChangeSignal } from '../domain/invariants'

interface Props {
  hotelId: string
  recipeId: string
}

export function EscandalloLiveView({ hotelId, recipeId }: Props) {
  const { data, isLoading, error, refetch } = useEscandalloLive(hotelId, recipeId)
  const sync = useSyncEscandalloPrices(hotelId)

  if (isLoading) return <p className="kpi-label">Cargando escandallo live…</p>
  if (error) return <p className="text-danger">Error: {error.message}</p>
  if (!data) return null

  const totalSignal = priceChangeSignal(data.recipe_total_cost, data.latest_total_cost)
  const totalDeltaColor =
    totalSignal === 'up'
      ? 'text-[color:var(--color-danger-fg)]'
      : totalSignal === 'down'
        ? 'text-[color:var(--color-success-fg)]'
        : 'text-[color:var(--color-text-muted)]'

  return (
    <div className="space-y-4">
      <div
        className="grid gap-4 rounded border p-4 md:grid-cols-3"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <div>
          <p className="kpi-label">Coste receta (snapshot)</p>
          <p className="font-data text-lg">
            {data.recipe_total_cost.toLocaleString('es-ES', {
              style: 'currency',
              currency: 'EUR',
            })}
          </p>
        </div>
        <div>
          <p className="kpi-label">Coste con últimos albaranes</p>
          <p className="font-data text-lg">
            {data.latest_total_cost.toLocaleString('es-ES', {
              style: 'currency',
              currency: 'EUR',
            })}
          </p>
        </div>
        <div>
          <p className="kpi-label">Diferencia</p>
          <p className={`font-data text-lg ${totalDeltaColor}`}>
            {data.delta_abs >= 0 ? '+' : ''}
            {data.delta_abs.toLocaleString('es-ES', {
              style: 'currency',
              currency: 'EUR',
            })}{' '}
            ({data.delta_pct.toFixed(1)}%)
          </p>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          Refrescar
        </Button>
        <Button
          size="sm"
          disabled={sync.isPending}
          onClick={() => sync.mutate(recipeId)}
        >
          {sync.isPending ? 'Sincronizando…' : 'Sincronizar con albarán'}
        </Button>
      </div>

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
              <th className="kpi-label px-3 py-2">Ingrediente</th>
              <th className="kpi-label px-3 py-2 text-right">€ receta</th>
              <th className="kpi-label px-3 py-2 text-right">€ último albarán</th>
              <th className="kpi-label px-3 py-2 text-right">Δ</th>
              <th className="kpi-label px-3 py-2">Signal</th>
            </tr>
          </thead>
          <tbody>
            {data.ingredients.map((i) => {
              const variant =
                i.signal === 'up'
                  ? 'urgent'
                  : i.signal === 'down'
                    ? 'success'
                    : i.signal === 'no_data'
                      ? 'warning'
                      : 'neutral'
              return (
                <tr
                  key={i.recipe_ingredient_id}
                  className="border-t"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <td className="px-3 py-2">{i.ingredient_name}</td>
                  <td className="px-3 py-2 text-right font-data">
                    {i.recipe_unit_cost.toLocaleString('es-ES', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </td>
                  <td className="px-3 py-2 text-right font-data">
                    {i.latest_gr_unit_cost != null
                      ? i.latest_gr_unit_cost.toLocaleString('es-ES', {
                          style: 'currency',
                          currency: 'EUR',
                        })
                      : '—'}
                  </td>
                  <td className="px-3 py-2 text-right font-data">
                    {i.delta_pct != null ? `${i.delta_pct.toFixed(1)}%` : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`badge-status ${variant}`}>{i.signal}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
