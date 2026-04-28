'use client'

import Link from 'next/link'
import {
  AlertTriangle,
  MinusCircle,
  PackageCheck,
  SlidersHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInventorySnapshot } from '../application/use-inventory-snapshot'
import { useProductLots } from '../application/use-product-lots'
import { useProductMovements } from '../application/use-product-movements'
import { InventoryMovementBadge } from './inventory-movement-badge'

const numberFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 4,
})

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
})

export function InventoryProductDetail({
  hotelId,
  productId,
}: {
  hotelId: string
  productId: string
}) {
  const snapshot = useInventorySnapshot({ hotelId, onlyWithStock: false })
  const lots = useProductLots(hotelId, productId)
  const movements = useProductMovements(hotelId, productId, { limit: 50, offset: 0 })

  const product = snapshot.data?.find((row) => row.product_id === productId)
  const activeLots = lots.data ?? []
  const movementRows = movements.data ?? []

  return (
    <div className="space-y-4">
      <section
        className="rounded border p-4"
        style={{
          borderColor: 'var(--color-border)',
          background: 'var(--color-bg-card)',
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="kpi-label">Producto</p>
            <h2>{product?.name ?? productId}</h2>
            <p className="font-code text-xs text-[color:var(--color-text-muted)]">
              {productId}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href={`/inventory/products/${productId}/consume`}>
                <MinusCircle className="h-4 w-4" aria-hidden="true" />
                Consumir
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href={`/inventory/products/${productId}/waste`}>
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                Merma
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href="/inventory/transfer">
                <PackageCheck className="h-4 w-4" aria-hidden="true" />
                Transferir
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href={`/inventory/products/${productId}/adjustment`}>
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Ajuste
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <Metric
            label="Stock"
            value={numberFormatter.format(product?.qty_on_hand ?? 0)}
          />
          <Metric
            label="Valor"
            value={currencyFormatter.format(product?.valor_stock ?? 0)}
          />
          <Metric label="Lotes activos" value={product?.lots_count ?? 0} />
          <Metric
            label="Último coste"
            value={
              product?.last_unit_cost !== null && product?.last_unit_cost !== undefined
                ? currencyFormatter.format(product.last_unit_cost)
                : '—'
            }
          />
        </div>
      </section>

      <section
        className="rounded border"
        style={{
          borderColor: 'var(--color-border)',
          background: 'var(--color-bg-card)',
        }}
      >
        <div className="border-b p-4" style={{ borderColor: 'var(--color-border)' }}>
          <h3>Lotes activos FIFO</h3>
        </div>
        {lots.isLoading ? <p className="kpi-label p-4">Cargando lotes...</p> : null}
        {lots.error ? <p className="p-4 text-danger">Error: {lots.error.message}</p> : null}
        {!lots.isLoading && activeLots.length === 0 ? (
          <div className="p-4 text-sm text-[color:var(--color-text-muted)]">
            <PackageCheck className="mb-2 h-5 w-5" aria-hidden="true" />
            No hay lotes con cantidad disponible.
          </div>
        ) : null}
        {activeLots.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-left"
                  style={{
                    background: 'var(--color-bg-sidebar)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <th className="kpi-label px-3 py-2">FIFO</th>
                  <th className="kpi-label px-3 py-2">Recibido</th>
                  <th className="kpi-label px-3 py-2">Almacén</th>
                  <th className="kpi-label px-3 py-2">Disponible</th>
                  <th className="kpi-label px-3 py-2">Coste</th>
                  <th className="kpi-label px-3 py-2">Caducidad</th>
                  <th className="kpi-label px-3 py-2">GR</th>
                </tr>
              </thead>
              <tbody>
                {activeLots.map((lot, index) => (
                  <tr
                    key={lot.id}
                    className="border-t"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <td className="px-3 py-2 font-code text-xs">#{index + 1}</td>
                    <td className="px-3 py-2 font-data">
                      {new Date(lot.received_at).toLocaleString('es-ES')}
                    </td>
                    <td className="px-3 py-2">{lot.warehouse_name ?? '—'}</td>
                    <td className="px-3 py-2 font-data">
                      {numberFormatter.format(lot.quantity_remaining)}{' '}
                      {lot.unit_abbreviation ?? ''}
                    </td>
                    <td className="px-3 py-2 font-data">
                      {currencyFormatter.format(lot.unit_cost)}
                    </td>
                    <td className="px-3 py-2 font-data">
                      {lot.expires_at ? new Date(lot.expires_at).toLocaleDateString('es-ES') : '—'}
                    </td>
                    <td className="px-3 py-2 font-code text-xs">
                      {lot.goods_receipt_id ? (
                        <Link
                          href={`/procurement/goods-receipts/${lot.goods_receipt_id}`}
                          className="hover:underline"
                        >
                          {lot.goods_receipt_id.slice(0, 8)}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section
        className="rounded border"
        style={{
          borderColor: 'var(--color-border)',
          background: 'var(--color-bg-card)',
        }}
      >
        <div className="border-b p-4" style={{ borderColor: 'var(--color-border)' }}>
          <h3>Movimientos</h3>
        </div>
        {movements.isLoading ? (
          <p className="kpi-label p-4">Cargando movimientos...</p>
        ) : null}
        {movements.error ? (
          <p className="p-4 text-danger">Error: {movements.error.message}</p>
        ) : null}
        {!movements.isLoading && movementRows.length === 0 ? (
          <p className="p-4 text-sm text-[color:var(--color-text-muted)]">
            Sin movimientos registrados.
          </p>
        ) : null}
        {movementRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-left"
                  style={{
                    background: 'var(--color-bg-sidebar)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <th className="kpi-label px-3 py-2">Fecha</th>
                  <th className="kpi-label px-3 py-2">Tipo</th>
                  <th className="kpi-label px-3 py-2">Almacén</th>
                  <th className="kpi-label px-3 py-2">Cantidad</th>
                  <th className="kpi-label px-3 py-2">Coste unit.</th>
                  <th className="kpi-label px-3 py-2">Total</th>
                  <th className="kpi-label px-3 py-2">Notas</th>
                </tr>
              </thead>
              <tbody>
                {movementRows.map((movement) => (
                  <tr
                    key={movement.id}
                    className="border-t"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <td className="px-3 py-2 font-data">
                      {new Date(movement.created_at).toLocaleString('es-ES')}
                    </td>
                    <td className="px-3 py-2">
                      <InventoryMovementBadge kind={movement.kind} />
                    </td>
                    <td className="px-3 py-2">{movement.warehouse_name ?? '—'}</td>
                    <td className="px-3 py-2 font-data">
                      {numberFormatter.format(movement.quantity)}{' '}
                      {movement.unit_abbreviation ?? ''}
                    </td>
                    <td className="px-3 py-2 font-data">
                      {currencyFormatter.format(movement.unit_cost)}
                    </td>
                    <td className="px-3 py-2 font-data">
                      {currencyFormatter.format(movement.total_cost ?? 0)}
                    </td>
                    <td className="px-3 py-2">{movement.notes ?? '—'}</td>
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

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="rounded border p-3"
      style={{
        borderColor: 'var(--color-border)',
        background: 'var(--color-bg-primary)',
      }}
    >
      <p className="kpi-label">{label}</p>
      <p className="mt-1 font-data text-lg">{value}</p>
    </div>
  )
}
