'use client'

import type { ParsedIngredientRow, ParsedRecipeRow, RowValidationIssue } from '../domain/types'

interface PreviewProps {
  validRecipes: ParsedRecipeRow[]
  validIngredients: ParsedIngredientRow[]
  recipeIssues: RowValidationIssue[]
  ingredientIssues: RowValidationIssue[]
}

export function ImportPreviewTable({
  validRecipes,
  validIngredients,
  recipeIssues,
  ingredientIssues,
}: PreviewProps) {
  return (
    <div className="space-y-6">
      <Section
        title={`Recetas — ${validRecipes.length} válidas / ${recipeIssues.length} errores`}
        issues={recipeIssues}
      >
        {validRecipes.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left"
                style={{ background: 'var(--color-bg-sidebar)', color: 'var(--color-text-muted)' }}
              >
                <th className="kpi-label px-3 py-2">Fila</th>
                <th className="kpi-label px-3 py-2">Nombre</th>
                <th className="kpi-label px-3 py-2">Categoría</th>
                <th className="kpi-label px-3 py-2 text-right">Pax</th>
                <th className="kpi-label px-3 py-2">Alérgenos</th>
              </tr>
            </thead>
            <tbody>
              {validRecipes.map((r) => (
                <tr key={r.excel_row} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <td className="px-3 py-1.5 font-data text-xs">{r.excel_row}</td>
                  <td className="px-3 py-1.5">{r.name}</td>
                  <td className="px-3 py-1.5 text-[color:var(--color-text-secondary)]">{r.category}</td>
                  <td className="px-3 py-1.5 text-right font-data">{r.servings}</td>
                  <td className="px-3 py-1.5 kpi-label">{r.allergens.join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <Section
        title={`Ingredientes — ${validIngredients.length} válidos / ${ingredientIssues.length} errores`}
        issues={ingredientIssues}
      >
        {validIngredients.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left"
                style={{ background: 'var(--color-bg-sidebar)', color: 'var(--color-text-muted)' }}
              >
                <th className="kpi-label px-3 py-2">Fila</th>
                <th className="kpi-label px-3 py-2">Receta</th>
                <th className="kpi-label px-3 py-2">Ingrediente</th>
                <th className="kpi-label px-3 py-2 text-right">Cantidad</th>
                <th className="kpi-label px-3 py-2">Unidad</th>
              </tr>
            </thead>
            <tbody>
              {validIngredients.map((i) => (
                <tr key={`${i.excel_row}-${i.ingredient_name}`} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <td className="px-3 py-1.5 font-data text-xs">{i.excel_row}</td>
                  <td className="px-3 py-1.5">{i.recipe_name}</td>
                  <td className="px-3 py-1.5">{i.ingredient_name}</td>
                  <td className="px-3 py-1.5 text-right font-data">{i.quantity_gross}</td>
                  <td className="px-3 py-1.5 kpi-label">{i.unit ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </div>
  )
}

function Section({
  title,
  issues,
  children,
}: {
  title: string
  issues: RowValidationIssue[]
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-medium">{title}</h3>
      {issues.length > 0 && (
        <ul
          className="space-y-1 rounded border p-3 text-xs"
          style={{ borderColor: 'var(--urgent-border)', background: 'var(--urgent-bg)' }}
        >
          {issues.map((iss, idx) => (
            <li key={idx} className="font-data">
              Fila {iss.excel_row}
              {iss.field ? ` · ${iss.field}` : ''} — {iss.message}
            </li>
          ))}
        </ul>
      )}
      <div
        className="overflow-hidden rounded border"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        {children}
      </div>
    </section>
  )
}
