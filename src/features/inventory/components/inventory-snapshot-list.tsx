'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { PackageSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProductCategories, useSuppliers } from '@/features/catalog'
import { useInventorySnapshot } from '../application/use-inventory-snapshot'
import { inventorySnapshotTotals } from '../domain/snapshot'

const numberFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 4,
})

const currencyFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
})

export function InventorySnapshotList({ hotelId }: { hotelId: string }) {
  const [categoryId, setCategoryId] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [onlyWithStock, setOnlyWithStock] = useState(true)

  const categories = useProductCategories(hotelId)
  const suppliers = useSuppliers({ hotelId, activeOnly: true }, { pageSize: 200 })
  const filter = useMemo(
    () => ({
      hotelId,
      categoryId: categoryId || undefined,
      supplierId: supplierId || undefined,
      onlyWithStock,
    }),
    [categoryId, hotelId, onlyWithStock, supplierId]
  )
  const snapshot = useInventorySnapshot(filter)
  const rows = snapshot.data ?? []
  const totals = inventorySnapshotTotals(rows)

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Productos con stock" value={totals.productsWithStock} />
        <Metric label="Productos listados" value={totals.products} />
        <Metric label="Unidades on hand" value={numberFormatter.format(totals.qtyOnHand)} />
        <Metric label="Valor stock" value={currencyFormatter.format(totals.stockValue)} />
      </div>

      <div
        className="grid gap-3 rounded border p-4 md:grid-cols-4"
        style={{
          borderColor: 'var(--color-border)',
          background: 'var(--color-bg-card)',
        }}
      >
        <div>
          <label htmlFor="inventory-category" className="kpi-label mb-1 block">
            Categoría
          </label>
          <select
            id="inventory-category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-input)',
            }}
          >
            <option value="">Todas</option>
            {(categories.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="inventory-supplier" className="kpi-label mb-1 block">
            Proveedor
          </label>
          <select
            id="inventory-supplier"
            value={supplierId}
            onChange={(event) => setSupplierId(event.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-input)',
            }}
          >
            <option value="">Todos</option>
            {(suppliers.data?.rows ?? []).map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 self-end text-sm">
          <input
            type="checkbox"
            checked={onlyWithStock}
            onChange={(event) => setOnlyWithStock(event.target.checked)}
          />
          Sólo con stock
        </label>

        <div className="self-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setCategoryId('')
              setSupplierId('')
              setOnlyWithStock(true)
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      </div>

      {snapshot.isLoading ? <p className="kpi-label">Cargando inventario...</p> : null}
      {snapshot.error ? <p className="text-danger">Error: {snapshot.error.message}</p> : null}

      {!snapshot.isLoading && rows.length === 0 ? (
        <div
          className="rounded border p-6"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          <PackageSearch className="mb-3 h-5 w-5" aria-hidden="true" />
          <h2>Sin stock visible</h2>
          <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
            No hay productos que coincidan con los filtros actuales.
          </p>
        </div>
      ) : null}

      {rows.length > 0 ? (
        <div
          className="overflow-hidden rounded border"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-card)',
          }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left"
                style={{
                  background: 'var(--color-bg-sidebar)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <th className="kpi-label px-3 py-2">Producto</th>
                <th className="kpi-label px-3 py-2">Stock</th>
                <th className="kpi-label px-3 py-2">Valor</th>
                <th className="kpi-label px-3 py-2">Lotes</th>
                <th className="kpi-label px-3 py-2">Última entrada</th>
                <th className="kpi-label px-3 py-2">Último coste</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.product_id}
                  className="border-t transition-colors hover:bg-[color:var(--color-bg-hover)]"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <td className="px-3 py-2">
                    <Link
                      href={`/inventory/products/${row.product_id}`}
                      className="font-medium hover:underline"
                    >
                      {row.name}
                    </Link>
                    <p className="font-code text-xs text-[color:var(--color-text-muted)]">
                      {row.product_id.slice(0, 8)}
                    </p>
                  </td>
                  <td className="px-3 py-2 font-data">
                    {numberFormatter.format(row.qty_on_hand)}
                  </td>
                  <td className="px-3 py-2 font-data">
                    {currencyFormatter.format(row.valor_stock)}
                  </td>
                  <td className="px-3 py-2 font-data">{row.lots_count}</td>
                  <td className="px-3 py-2 font-data">
                    {row.last_received_at
                      ? new Date(row.last_received_at).toLocaleString('es-ES')
                      : '—'}
                  </td>
                  <td className="px-3 py-2 font-data">
                    {row.last_unit_cost !== null
                      ? currencyFormatter.format(row.last_unit_cost)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="rounded border p-4"
      style={{
        borderColor: 'var(--color-border)',
        background: 'var(--color-bg-card)',
      }}
    >
      <p className="kpi-label">{label}</p>
      <p className="mt-1 font-data text-xl">{value}</p>
    </div>
  )
}
