'use client'

import { Badge } from '@/components/ui/badge'
import { RECIPE_STATUS_LABELS, RECIPE_STATUS_VARIANT } from '../domain/invariants'
import type { RecipeStatus } from '../domain/types'

export function RecipeStatusBadge({ status }: { status: RecipeStatus }) {
  return <Badge variant={RECIPE_STATUS_VARIANT[status]}>{RECIPE_STATUS_LABELS[status]}</Badge>
}
