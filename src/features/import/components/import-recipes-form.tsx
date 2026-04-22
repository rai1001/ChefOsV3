'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { parseRecipesExcel } from '../application/parse-excel'
import { validatePayload } from '../application/validate-payload'
import { useImportRecipes } from '../application/use-import-recipes'
import {
  EmptyImportError,
  ExcelParseError,
  MissingSheetError,
} from '../domain/errors'
import type { ImportResult, ValidationReport } from '../domain/types'
import { ImportPreviewTable } from './import-preview-table'
import { ImportResultSummary } from './import-result-summary'
import { TemplateDownloadButton } from './template-download-button'
import type { ImportRecipesRpcPayload } from '../infrastructure/import-queries'

interface Props {
  hotelId: string
}

type Phase =
  | { kind: 'idle' }
  | { kind: 'parsing' }
  | { kind: 'parsed'; report: ValidationReport; fileName: string }
  | { kind: 'committing' }
  | { kind: 'done'; result: ImportResult }
  | { kind: 'error'; message: string }

export function ImportRecipesForm({ hotelId }: Props) {
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const inputRef = useRef<HTMLInputElement>(null)
  const importMutation = useImportRecipes()

  const reset = () => {
    setPhase({ kind: 'idle' })
    if (inputRef.current) inputRef.current.value = ''
  }

  const onFile = async (file: File) => {
    setPhase({ kind: 'parsing' })
    try {
      const buffer = await file.arrayBuffer()
      const parsed = await parseRecipesExcel(buffer)
      const report = validatePayload(parsed)
      setPhase({ kind: 'parsed', report, fileName: file.name })
    } catch (err) {
      const message =
        err instanceof MissingSheetError
          ? err.message
          : err instanceof EmptyImportError
          ? err.message
          : err instanceof ExcelParseError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Error desconocido leyendo el Excel'
      setPhase({ kind: 'error', message })
    }
  }

  const onConfirm = async () => {
    if (phase.kind !== 'parsed') return
    const { validRecipes, validIngredients } = phase.report
    if (validRecipes.length === 0) {
      setPhase({ kind: 'error', message: 'No hay recetas válidas para importar.' })
      return
    }

    setPhase({ kind: 'committing' })
    try {
      const payload: ImportRecipesRpcPayload = {
        recipes: validRecipes.map((r) => ({
          name: r.name,
          category: r.category,
          servings: r.servings,
          description: r.description ?? null,
          subcategory: r.subcategory ?? null,
          prep_time_min: r.prep_time_min ?? null,
          cook_time_min: r.cook_time_min ?? null,
          rest_time_min: r.rest_time_min ?? null,
          target_price: r.target_price ?? null,
          allergens: r.allergens,
          dietary_tags: r.dietary_tags,
          notes: r.notes ?? null,
          difficulty: r.difficulty ?? null,
        })),
        ingredients: validIngredients.map((i) => ({
          recipe_name: i.recipe_name,
          ingredient_name: i.ingredient_name,
          quantity_gross: i.quantity_gross,
          waste_pct: i.waste_pct,
          unit_cost: i.unit_cost,
          preparation_notes: i.unit
            ? `Unidad original Excel: ${i.unit}${i.preparation_notes ? `. ${i.preparation_notes}` : ''}`
            : i.preparation_notes ?? null,
        })),
      }

      const result = await importMutation.mutateAsync({ hotelId, payload })
      setPhase({ kind: 'done', result })
    } catch (err) {
      setPhase({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Error subiendo el import',
      })
    }
  }

  return (
    <div className="space-y-6">
      {phase.kind !== 'done' && (
        <div className="flex items-end gap-2 flex-wrap">
          <div className="space-y-1 flex-1 min-w-[260px]">
            <Label htmlFor="import-file">Archivo Excel (.xlsx)</Label>
            <Input
              ref={inputRef}
              id="import-file"
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              disabled={phase.kind === 'parsing' || phase.kind === 'committing'}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void onFile(file)
              }}
            />
          </div>
          <TemplateDownloadButton />
        </div>
      )}

      {phase.kind === 'parsing' && <p className="kpi-label">Leyendo archivo…</p>}

      {phase.kind === 'error' && (
        <div
          className="rounded border p-3 text-sm"
          style={{
            borderColor: 'var(--urgent-border)',
            background: 'var(--urgent-bg)',
            color: 'var(--color-danger-fg)',
          }}
        >
          {phase.message}
          <div className="mt-2">
            <Button size="sm" variant="ghost" onClick={reset}>
              Probar otro archivo
            </Button>
          </div>
        </div>
      )}

      {phase.kind === 'parsed' && (
        <>
          <p className="kpi-label">
            <span className="font-data">{phase.fileName}</span> · listo para revisar
          </p>
          <ImportPreviewTable
            validRecipes={phase.report.validRecipes}
            validIngredients={phase.report.validIngredients}
            recipeIssues={phase.report.recipeIssues}
            ingredientIssues={phase.report.ingredientIssues}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={reset}>
              Cancelar
            </Button>
            <Button
              disabled={phase.report.validRecipes.length === 0}
              onClick={onConfirm}
            >
              Importar {phase.report.validRecipes.length} recetas
            </Button>
          </div>
        </>
      )}

      {phase.kind === 'committing' && (
        <p className="kpi-label">Subiendo al servidor…</p>
      )}

      {phase.kind === 'done' && (
        <ImportResultSummary result={phase.result} onReset={reset} />
      )}
    </div>
  )
}
