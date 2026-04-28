'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle2, ClipboardCheck, Play, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWarehouses } from '@/features/warehouse'
import { ProductionInsufficientStockError } from '../domain/errors'
import {
  canCancelProductionOrder,
  canCompleteProductionOrder,
  canStartProductionOrder,
} from '../domain/order'
import { useCheckFeasibility } from '../application/use-check-feasibility'
import { useCompleteProduction } from '../application/use-complete-production'
import { useProductionDetail } from '../application/use-production-detail'
import { useStartProduction } from '../application/use-start-production'
import { ProductionStatusBadge } from './production-status-badge'
import { SubrecipeTree } from './subrecipe-tree'

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
})

const numberFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 4,
})

export function ProductionOrderDetail({
  hotelId,
  orderId,
}: {
  hotelId: string
  orderId: string
}) {
  const detail = useProductionDetail(hotelId, orderId)
  const feasibility = useCheckFeasibility()
  const startProduction = useStartProduction()
  const completeProduction = useCompleteProduction()
  const warehouses = useWarehouses(hotelId, { activeOnly: true })
  const [startError, setStartError] = useState<ProductionInsufficientStockError | null>(null)
  const [warehouseId, setWarehouseId] = useState<string | null>(null)
  const [checkedWarehouseId, setCheckedWarehouseId] = useState<string | null>(null)

  if (detail.isLoading) return <p className="kpi-label">Cargando orden...</p>
  if (detail.error) return <p className="text-danger">Error: {detail.error.message}</p>
  if (!detail.data) return null

  const { order, lines, movements, subrecipe_productions } = detail.data
  const feasibilityData = feasibility.data
  const deficits = startError?.deficits ?? feasibilityData?.deficits ?? []
  const subrecipeChain =
    startError?.feasibility?.subrecipe_chain ?? feasibilityData?.subrecipe_chain ?? []
  const canStart = canStartProductionOrder(order.status)
  const defaultWarehouseId =
    (warehouses.data ?? []).find((warehouse) => warehouse.is_default)?.id ??
    warehouses.data?.[0]?.id ??
    ''
  const selectedWarehouseId = warehouseId ?? defaultWarehouseId
  const canStartNow =
    canStart &&
    feasibilityData?.feasible === true &&
    checkedWarehouseId === selectedWarehouseId

  const checkStock = async () => {
    setStartError(null)
    await feasibility.mutateAsync({
      hotel_id: hotelId,
      production_order_id: orderId,
      warehouse_id: selectedWarehouseId || null,
    })
    setCheckedWarehouseId(selectedWarehouseId)
  }

  const start = async () => {
    setStartError(null)
    try {
      await startProduction.mutateAsync({
        hotel_id: hotelId,
        production_order_id: orderId,
        warehouse_id: selectedWarehouseId || null,
      })
    } catch (error) {
      if (error instanceof ProductionInsufficientStockError) {
        setStartError(error)
      }
    }
  }

  const complete = async () => {
    await completeProduction.mutateAsync({
      hotel_id: hotelId,
      production_order_id: orderId,
    })
  }

  return (
    <div className="space-y-6">
      <section
        className="rounded border p-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="kpi-label">Orden</p>
            <h2>{order.recipe_name}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <ProductionStatusBadge status={order.status} />
              <span className="badge-status neutral">
                {numberFormatter.format(order.servings)} raciones
              </span>
              {order.scheduled_at ? (
                <span className="badge-status info">
                  {new Date(order.scheduled_at).toLocaleString('es-ES')}
                </span>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2 text-right">
            <p className="font-data text-xl">
              {currencyFormatter.format(order.estimated_total_cost)}
            </p>
            <p className="font-data text-sm text-[color:var(--color-text-muted)]">
              real {currencyFormatter.format(order.actual_total_cost)}
            </p>
          </div>
        </div>

        {canStart ? (
          <div className="mt-4 max-w-sm">
            <label htmlFor="production-start-warehouse" className="kpi-label mb-1 block">
              Almacén origen
            </label>
            <select
              id="production-start-warehouse"
              value={selectedWarehouseId}
              onChange={(event) => {
                setWarehouseId(event.target.value)
                setCheckedWarehouseId(null)
                setStartError(null)
                feasibility.reset()
              }}
              className="w-full rounded border px-3 py-2 text-sm"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-bg-input)',
              }}
            >
              <option value="">Global hotel</option>
              {(warehouses.data ?? []).map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {canStart ? (
            <>
              <Button
                type="button"
                variant="secondary"
                disabled={feasibility.isPending}
                onClick={checkStock}
              >
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                Comprobar viabilidad
              </Button>
              <Button
                type="button"
                disabled={!canStartNow || startProduction.isPending}
                onClick={start}
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                Iniciar producción
              </Button>
            </>
          ) : null}

          {canCompleteProductionOrder(order.status) ? (
            <Button
              type="button"
              disabled={completeProduction.isPending}
              onClick={complete}
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Marcar completada
            </Button>
          ) : null}

          {canCancelProductionOrder(order.status) ? (
            <Button asChild variant="danger">
              <Link href={`/production/${orderId}/cancel`}>
                <XCircle className="h-4 w-4" aria-hidden="true" />
                Cancelar
              </Link>
            </Button>
          ) : null}
        </div>

        {feasibilityData?.feasible ? (
          <p className="mt-3 text-sm text-success">
            Stock suficiente.
          </p>
        ) : null}
        {startProduction.error && !(startProduction.error instanceof ProductionInsufficientStockError) ? (
          <p className="mt-3 text-sm text-danger">{startProduction.error.message}</p>
        ) : null}
        {completeProduction.error ? (
          <p className="mt-3 text-sm text-danger">{completeProduction.error.message}</p>
        ) : null}
      </section>

      {deficits.length > 0 ? (
        <section className="space-y-2">
          <h2>Faltantes</h2>
          <div
            className="overflow-hidden rounded border"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ background: 'var(--color-bg-sidebar)' }}>
                  <th className="kpi-label px-3 py-2">Producto</th>
                  <th className="kpi-label px-3 py-2">Requerido</th>
                  <th className="kpi-label px-3 py-2">Disponible</th>
                  <th className="kpi-label px-3 py-2">Falta</th>
                </tr>
              </thead>
              <tbody>
                {deficits.map((deficit) => (
                  <tr key={deficit.product_id} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <td className="px-3 py-2 font-code text-xs">{deficit.product_id.slice(0, 8)}</td>
                    <td className="px-3 py-2 font-data">{numberFormatter.format(deficit.required)}</td>
                    <td className="px-3 py-2 font-data">{numberFormatter.format(deficit.available)}</td>
                    <td className="px-3 py-2 font-data">{numberFormatter.format(deficit.missing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <SubrecipeTree chain={subrecipeChain} productions={subrecipe_productions} />

      <section className="space-y-2">
        <h2>Líneas</h2>
        <div
          className="overflow-hidden rounded border"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ background: 'var(--color-bg-sidebar)' }}>
                <th className="kpi-label px-3 py-2">Producto</th>
                <th className="kpi-label px-3 py-2">Requerido</th>
                <th className="kpi-label px-3 py-2">Consumido</th>
                <th className="kpi-label px-3 py-2">Coste estimado</th>
                <th className="kpi-label px-3 py-2">Coste real</th>
                <th className="kpi-label px-3 py-2">Origen</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <td className="px-3 py-2">{line.product_name ?? line.product_id.slice(0, 8)}</td>
                  <td className="px-3 py-2 font-data">
                    {numberFormatter.format(line.quantity_required)} {line.unit_abbreviation}
                  </td>
                  <td className="px-3 py-2 font-data">
                    {line.actual_consumed_quantity !== null
                      ? numberFormatter.format(line.actual_consumed_quantity)
                      : '-'}
                  </td>
                  <td className="px-3 py-2 font-data">
                    {currencyFormatter.format(line.estimated_total_cost)}
                  </td>
                  <td className="px-3 py-2 font-data">
                    {line.actual_total_cost !== null
                      ? currencyFormatter.format(line.actual_total_cost)
                      : '-'}
                  </td>
                  <td className="px-3 py-2">
                    {line.source_recipe_id ? (
                      <span className="badge-status info">Sub-receta</span>
                    ) : (
                      <span className="badge-status neutral">Producto</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2">
        <h2>Movimientos</h2>
        {movements.length === 0 ? (
          <p className="text-sm text-[color:var(--color-text-muted)]">Sin movimientos.</p>
        ) : (
          <div
            className="overflow-hidden rounded border"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ background: 'var(--color-bg-sidebar)' }}>
                  <th className="kpi-label px-3 py-2">Fecha</th>
                  <th className="kpi-label px-3 py-2">Producto</th>
                  <th className="kpi-label px-3 py-2">Lote</th>
                  <th className="kpi-label px-3 py-2">Cantidad</th>
                  <th className="kpi-label px-3 py-2">Coste</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <td className="px-3 py-2 font-data">
                      {new Date(movement.created_at).toLocaleString('es-ES')}
                    </td>
                    <td className="px-3 py-2">{movement.product_name ?? movement.product_id.slice(0, 8)}</td>
                    <td className="px-3 py-2 font-code text-xs">{movement.lot_id?.slice(0, 8) ?? '-'}</td>
                    <td className="px-3 py-2 font-data">
                      {numberFormatter.format(movement.quantity)} {movement.unit_abbreviation}
                    </td>
                    <td className="px-3 py-2 font-data">
                      {movement.total_cost !== null
                        ? currencyFormatter.format(movement.total_cost)
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
