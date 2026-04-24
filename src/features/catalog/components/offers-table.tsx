'use client'

import { useState } from 'react'
import {
  useDeleteOffer,
  useMarkOfferPreferred,
  useOffersBySupplier,
} from '../application/use-supplier-offers'
import { useProducts } from '../application/use-products'
import { useUnits } from '../application/use-units'
import { isOfferValidNow } from '../domain/invariants'
import { OfferForm } from './offer-form'
import { Button } from '@/components/ui/button'

interface Props {
  hotelId: string
  supplierId: string
}

export function OffersTable({ hotelId, supplierId }: Props) {
  const { data: offers = [], isLoading, error } = useOffersBySupplier(hotelId, supplierId)
  const { data: productsPage } = useProducts(
    { hotelId, activeOnly: true },
    { pageSize: 500 }
  )
  const { data: units = [] } = useUnits(hotelId)
  const products = productsPage?.rows ?? []
  const del = useDeleteOffer()
  const markPref = useMarkOfferPreferred()
  const [showForm, setShowForm] = useState(false)

  const productById = new Map(products.map((p) => [p.id, p]))
  const unitById = new Map(units.map((u) => [u.id, u]))

  if (error) return <p className="text-danger">Error: {error.message}</p>

  return (
    <div className="space-y-3">
      <div className="flex items-center">
        <p className="text-sm text-[color:var(--color-text-muted)]">
          {offers.length} oferta{offers.length === 1 ? '' : 's'}
        </p>
        <div className="ml-auto">
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Nueva oferta'}
          </Button>
        </div>
      </div>

      {showForm && (
        <div
          className="rounded border p-4"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-sidebar)',
          }}
        >
          <OfferForm
            hotelId={hotelId}
            supplierId={supplierId}
            products={products}
            units={units}
            onDone={() => setShowForm(false)}
          />
        </div>
      )}

      {isLoading ? (
        <p className="kpi-label">Cargando ofertas…</p>
      ) : offers.length === 0 ? (
        <p className="text-[color:var(--color-text-muted)]">
          Este proveedor no tiene ofertas aún.
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
                style={{
                  background: 'var(--color-bg-sidebar)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <th className="kpi-label px-3 py-2">Producto</th>
                <th className="kpi-label px-3 py-2 text-right">Precio</th>
                <th className="kpi-label px-3 py-2">Unidad</th>
                <th className="kpi-label px-3 py-2">SKU proveedor</th>
                <th className="kpi-label px-3 py-2">Vigencia</th>
                <th className="kpi-label px-3 py-2">Preferida</th>
                <th className="kpi-label px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => {
                const product = productById.get(o.product_id)
                const unit = o.unit_id ? unitById.get(o.unit_id) : null
                const valid = isOfferValidNow(o)
                return (
                  <tr
                    key={o.id}
                    className="border-t"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <td className="px-3 py-2">{product?.name ?? o.product_id.slice(0, 8)}</td>
                    <td className="px-3 py-2 text-right font-data">
                      {o.unit_price.toLocaleString('es-ES', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </td>
                    <td className="px-3 py-2 text-[color:var(--color-text-secondary)]">
                      {unit ? `${unit.name} (${unit.abbreviation})` : '—'}
                    </td>
                    <td className="px-3 py-2 text-[color:var(--color-text-secondary)]">
                      {o.sku_supplier ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-xs text-[color:var(--color-text-secondary)]">
                      {o.valid_from ?? '—'} → {o.valid_to ?? '—'}
                      {!valid && <span className="ml-2 text-danger">(fuera de vigencia)</span>}
                    </td>
                    <td className="px-3 py-2">
                      {o.is_preferred ? (
                        <span className="text-accent">★</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            markPref.mutate({ hotelId, offerId: o.id })
                          }
                          disabled={markPref.isPending}
                        >
                          Marcar
                        </Button>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          if (confirm(`¿Borrar oferta?`)) {
                            del.mutate({ hotelId, offerId: o.id })
                          }
                        }}
                        disabled={del.isPending}
                      >
                        Borrar
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
