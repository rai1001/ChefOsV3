'use client'

import { Badge } from '@/components/ui/badge'
import {
  INVENTORY_MOVEMENT_LABELS,
  INVENTORY_MOVEMENT_VARIANT,
  type InventoryMovementKind,
} from '../domain/movement'

export function InventoryMovementBadge({ kind }: { kind: InventoryMovementKind }) {
  return (
    <Badge variant={INVENTORY_MOVEMENT_VARIANT[kind]}>
      {INVENTORY_MOVEMENT_LABELS[kind]}
    </Badge>
  )
}
