'use client'

import { Button } from '@/components/ui/button'
import { useTransitionRecipe } from '../application/use-transition-recipe'
import {
  RECIPE_STATUS_LABELS,
  canSubmitForReview,
  getValidRecipeTransitions,
} from '../domain/invariants'
import type { RecipeIngredient, RecipeStatus } from '../domain/types'

interface Props {
  hotelId: string
  recipeId: string
  currentStatus: RecipeStatus
  ingredients: ReadonlyArray<RecipeIngredient>
}

export function RecipeTransitionButtons({ hotelId, recipeId, currentStatus, ingredients }: Props) {
  const transition = useTransitionRecipe(hotelId)
  const next = getValidRecipeTransitions(currentStatus)

  if (next.length === 0) {
    return (
      <p className="text-sm text-[color:var(--color-text-muted)]">
        Estado terminal — sin transiciones.
      </p>
    )
  }

  const handle = (to: RecipeStatus) => {
    if (to === 'review_pending' && !canSubmitForReview(ingredients)) {
      alert('Añade al menos un ingrediente antes de enviar a revisión.')
      return
    }
    transition.mutate({ recipeId, to })
  }

  return (
    <div className="flex flex-wrap gap-2">
      {next.map((to) => {
        const variant =
          to === 'draft' || to === 'archived' ? 'ghost' : to === 'deprecated' ? 'danger' : 'primary'
        return (
          <Button
            key={to}
            size="sm"
            variant={variant}
            disabled={transition.isPending}
            onClick={() => handle(to)}
          >
            → {RECIPE_STATUS_LABELS[to]}
          </Button>
        )
      })}
    </div>
  )
}
