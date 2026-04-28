'use client'

import Link from 'next/link'
import { Archive, CheckCircle2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WAREHOUSE_TYPE_LABELS } from '../domain/types'
import {
  useArchiveWarehouse,
  useSetDefaultWarehouse,
  useWarehouses,
} from '../application/use-warehouses'

export function WarehouseList({ hotelId }: { hotelId: string }) {
  const warehouses = useWarehouses({ hotelId, activeOnly: false })
  const archive = useArchiveWarehouse()
  const setDefault = useSetDefaultWarehouse()

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/warehouses/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo almacén
          </Link>
        </Button>
      </div>

      {warehouses.isLoading ? <p className="kpi-label">Cargando almacenes...</p> : null}
      {warehouses.error ? <p className="text-danger">Error: {warehouses.error.message}</p> : null}

      <div className="grid gap-3">
        {(warehouses.data ?? []).map((warehouse) => (
          <article
            key={warehouse.id}
            className="rounded border p-4"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-card)',
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/warehouses/${warehouse.id}`} className="font-medium hover:underline">
                    {warehouse.name}
                  </Link>
                  {warehouse.is_default ? (
                    <span className="badge-status success">default</span>
                  ) : null}
                  {!warehouse.is_active ? (
                    <span className="badge-status neutral">archivado</span>
                  ) : null}
                </div>
                <p className="kpi-label mt-1">
                  {WAREHOUSE_TYPE_LABELS[warehouse.warehouse_type]} · {warehouse.id.slice(0, 8)}
                </p>
                {warehouse.notes ? (
                  <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">
                    {warehouse.notes}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {!warehouse.is_default && warehouse.is_active ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      void setDefault.mutateAsync({
                        hotel_id: hotelId,
                        warehouse_id: warehouse.id,
                      })
                    }
                    disabled={setDefault.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Default
                  </Button>
                ) : null}
                {!warehouse.is_default && warehouse.is_active ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      void archive.mutateAsync({
                        hotel_id: hotelId,
                        warehouse_id: warehouse.id,
                      })
                    }
                    disabled={archive.isPending}
                  >
                    <Archive className="h-4 w-4" aria-hidden="true" />
                    Archivar
                  </Button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
