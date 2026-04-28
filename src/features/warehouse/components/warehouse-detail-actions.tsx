'use client'

import { Archive, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useArchiveWarehouse, useSetDefaultWarehouse } from '../application/use-warehouses'
import type { Warehouse } from '../domain/types'

export function WarehouseDetailActions({ warehouse }: { warehouse: Warehouse }) {
  const router = useRouter()
  const archive = useArchiveWarehouse()
  const setDefault = useSetDefaultWarehouse()

  async function setAsDefault() {
    await setDefault.mutateAsync({
      hotel_id: warehouse.hotel_id,
      warehouse_id: warehouse.id,
    })
    router.refresh()
  }

  async function archiveCurrent() {
    await archive.mutateAsync({
      hotel_id: warehouse.hotel_id,
      warehouse_id: warehouse.id,
    })
    router.refresh()
  }

  if (!warehouse.is_active || warehouse.is_default) return null

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={() => void setAsDefault()}
        disabled={setDefault.isPending}
      >
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        Definir default
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => void archiveCurrent()}
        disabled={archive.isPending}
      >
        <Archive className="h-4 w-4" aria-hidden="true" />
        Archivar
      </Button>
      {(archive.error || setDefault.error) ? (
        <p className="basis-full text-sm text-danger">
          {archive.error?.message ?? setDefault.error?.message}
        </p>
      ) : null}
    </div>
  )
}
