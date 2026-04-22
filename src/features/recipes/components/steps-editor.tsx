'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  useAddRecipeStep,
  useRecipeSteps,
  useRemoveRecipeStep,
} from '../application/use-recipe-steps'

interface Props {
  hotelId: string
  recipeId: string
  readOnly?: boolean
}

export function StepsEditor({ hotelId, recipeId, readOnly = false }: Props) {
  const stepsQ = useRecipeSteps(hotelId, recipeId)
  const add = useAddRecipeStep(hotelId)
  const remove = useRemoveRecipeStep(hotelId, recipeId)

  const [instruction, setInstruction] = useState('')
  const [duration, setDuration] = useState('')
  const [error, setError] = useState<string | null>(null)

  const steps = stepsQ.data ?? []

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    try {
      await add.mutateAsync({
        recipe_id: recipeId,
        step_number: steps.length + 1,
        instruction: instruction.trim(),
        duration_min: duration ? Number(duration) : null,
      })
      setInstruction('')
      setDuration('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error añadiendo paso')
    }
  }

  return (
    <div className="space-y-4">
      {stepsQ.isLoading ? (
        <p className="kpi-label">Cargando pasos…</p>
      ) : steps.length === 0 ? (
        <p className="text-sm text-[color:var(--color-text-muted)]">
          Sin pasos todavía.
        </p>
      ) : (
        <ol className="space-y-2">
          {steps.map((s) => (
            <li
              key={s.id}
              className="rounded border p-3 flex items-start gap-3"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
            >
              <span
                className="kpi-label text-xs flex-shrink-0 mt-1"
                style={{ minWidth: '24px' }}
              >
                #{s.step_number}
              </span>
              <div className="flex-1">
                <p className="text-sm whitespace-pre-wrap">{s.instruction}</p>
                {s.duration_min != null && (
                  <p className="kpi-label mt-1">{s.duration_min} min</p>
                )}
              </div>
              {!readOnly && (
                <Button
                  size="sm"
                  variant="danger"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(s.id)}
                >
                  Quitar
                </Button>
              )}
            </li>
          ))}
        </ol>
      )}

      {!readOnly && (
        <form
          onSubmit={submit}
          className="space-y-3 rounded border p-3"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
        >
          <div className="space-y-1">
            <Label htmlFor="step_text">Instrucción (paso {steps.length + 1})</Label>
            <Textarea
              id="step_text"
              rows={2}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              required
              placeholder="Describir el paso…"
            />
          </div>
          <div className="flex items-end gap-3">
            <div className="space-y-1 flex-1">
              <Label htmlFor="step_duration">Duración (min, opcional)</Label>
              <Input
                id="step_duration"
                type="number"
                min="0"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <Button type="submit" size="sm" disabled={add.isPending}>
              {add.isPending ? 'Añadiendo…' : 'Añadir paso'}
            </Button>
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
        </form>
      )}
    </div>
  )
}
