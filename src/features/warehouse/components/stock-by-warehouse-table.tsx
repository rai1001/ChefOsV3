'use client'

import { PackageSearch } from 'lucide-react'
import { useStockByWarehouse } from '../application/use-stock-by-warehouse'

const numberFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 4,
})

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
})

export function StockByWarehouseTable({
  hotelId,
  productId,
  warehouseId,
}: {
  hotelId: string
  productId?: string | null
  warehouseId?: string | null
}) {
  const stock = useStockByWarehouse(hotelId, productId)
  const rows = (stock.data ?? []).filter(
    (row) => !warehouseId || row.warehouse_id === warehouseId
  )

  if (stock.isLoading) return <p className="kpi-label">Cargando stock...</p>
  if (stock.error) return <p className="text-danger">Error: {stock.error.message}</p>

  if (rows.length === 0) {
    return (
      <div
        className="rounded border p-6"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <PackageSearch className="mb-3 h-5 w-5" aria-hidden="true" />
        <h2>Sin stock</h2>
        <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
          No hay stock activo para el filtro actual.
        </p>
      </div>
    )
  }

  return (
    <div
      className="overflow-hidden rounded border"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left" style={{ background: 'var(--color-bg-sidebar)' }}>
            <th className="kpi-label px-3 py-2">Almacén</th>
            <th className="kpi-label px-3 py-2">Producto</th>
            <th className="kpi-label px-3 py-2">Stock</th>
            <th className="kpi-label px-3 py-2">Coste medio</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.warehouse_id}:${row.product_id}:${row.unit_id}`}
              className="border-t"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <td className="px-3 py-2">{row.warehouse_name}</td>
              <td className="px-3 py-2">{row.product_name}</td>
              <td className="px-3 py-2 font-data">
                {numberFormatter.format(row.quantity_remaining)} {row.unit_abbreviation}
              </td>
              <td className="px-3 py-2 font-data">
                {currencyFormatter.format(row.unit_cost_avg)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
