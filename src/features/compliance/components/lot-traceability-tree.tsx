'use client'

import { FormEvent, useState } from 'react'
import { GitBranch, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLotTraceability, useTraceableLots } from '../application/use-lot-traceability'

export function LotTraceabilityTree({ hotelId }: { hotelId: string }) {
  const [search, setSearch] = useState('')
  const [lotId, setLotId] = useState('')
  const lots = useTraceableLots(hotelId, search)
  const trace = useLotTraceability(hotelId, lotId || undefined)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLotId(search.trim())
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={submit}
        className="flex flex-wrap items-end gap-3 rounded border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <label className="min-w-72 flex-1">
          <span className="kpi-label mb-1 block">Lote</span>
          <Input
            list="traceable-lots"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="UUID de lote"
          />
          <datalist id="traceable-lots">
            {(lots.data ?? []).map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.product_name ?? 'Producto'} · {lot.lot_number ?? lot.id.slice(0, 8)}
              </option>
            ))}
          </datalist>
        </label>
        <Button type="submit">
          <Search className="h-4 w-4" aria-hidden="true" />
          Trazar
        </Button>
      </form>

      {trace.error ? <p className="text-danger">Error: {trace.error.message}</p> : null}
      {trace.data ? (
        <section
          className="rounded border p-5"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
        >
          <div className="mb-4 flex items-center gap-2">
            <GitBranch className="h-5 w-5" aria-hidden="true" />
            <h2>{trace.data.lot.product_name}</h2>
          </div>
          <ol className="space-y-4 border-l pl-5" style={{ borderColor: 'var(--color-border)' }}>
            <TraceNode title="Lote" detail={`${trace.data.lot.id.slice(0, 8)} · ${trace.data.lot.quantity_remaining} restantes`} />
            <TraceNode title="Recepción" detail={trace.data.goods_receipt ? 'Con albarán y control vinculado' : 'Sin recepción vinculada'} />
            <TraceNode title="Pedido" detail={trace.data.purchase_order ? 'Pedido localizado' : 'Sin pedido vinculado'} />
            <TraceNode title="Producción" detail={trace.data.production ? 'Lote de producción' : 'No es preparación'} />
            <TraceNode title="Movimientos" detail={`${trace.data.movements.length} movimientos`} />
            <TraceNode title="Consumo en recetas" detail={`${trace.data.consumed_in_recipes.length} usos`} />
          </ol>
        </section>
      ) : null}
    </div>
  )
}

function TraceNode({ title, detail }: { title: string; detail: string }) {
  return (
    <li>
      <p className="kpi-label">{title}</p>
      <p className="text-sm">{detail}</p>
    </li>
  )
}

