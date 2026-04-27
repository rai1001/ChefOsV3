'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { ImportResult } from '../domain/types'

interface Props {
  result: ImportResult
  onReset: () => void
}

export function ImportResultSummary({ result, onReset }: Props) {
  const isPartial = result.failed_count > 0 && result.ok_count > 0
  const isSuccess = result.failed_count === 0 && result.ok_count > 0
  const isFailed = result.ok_count === 0

  const variant = isSuccess ? 'success' : isPartial ? 'warning' : 'urgent'
  const variantStyles =
    variant === 'success'
      ? { bg: 'var(--color-bg-card)', border: 'var(--color-success-border, #2a6f3f)' }
      : variant === 'warning'
      ? { bg: 'var(--color-bg-card)', border: 'var(--color-warning-border, #b58400)' }
      : { bg: 'var(--urgent-bg)', border: 'var(--urgent-border)' }

  return (
    <div className="space-y-4">
      <div
        className="rounded border p-4"
        style={{ background: variantStyles.bg, borderColor: variantStyles.border }}
      >
        <p className="kpi-label">Resultado del import</p>
        <p className="font-data text-lg">
          {result.ok_count} OK · {result.failed_count} fallos
        </p>
        {isSuccess && (
          <p className="text-sm mt-1">
            Todas las filas importadas. Las nuevas recetas están en estado <strong>borrador</strong>.
          </p>
        )}
        {isPartial && (
          <p className="text-sm mt-1">
            Algunas filas no se importaron. Descarga el CSV de errores, corrige y vuelve a subir
            solo esas.
          </p>
        )}
        {isFailed && (
          <p className="text-sm mt-1">
            No se importó ninguna fila. Revisa los errores abajo.
          </p>
        )}
      </div>

      {result.failed.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Errores ({result.failed.length})</h3>
            <Button size="sm" variant="ghost" onClick={() => downloadErrorsCsv(result)}>
              Descargar CSV
            </Button>
          </div>
          <div
            className="max-h-64 overflow-auto rounded border"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
          >
            <table className="w-full text-xs">
              <thead>
                <tr
                  className="text-left sticky top-0"
                  style={{
                    background: 'var(--color-bg-sidebar)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <th className="kpi-label px-3 py-2">Tipo</th>
                  <th className="kpi-label px-3 py-2">Fila</th>
                  <th className="kpi-label px-3 py-2">Nombre</th>
                  <th className="kpi-label px-3 py-2">Error</th>
                </tr>
              </thead>
              <tbody>
                {result.failed.map((f, idx) => (
                  <tr
                    key={idx}
                    className="border-t font-data"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <td className="px-3 py-1.5">{f.kind}</td>
                    <td className="px-3 py-1.5">{f.row_index}</td>
                    <td className="px-3 py-1.5">{f.name || '—'}</td>
                    <td className="px-3 py-1.5 text-[color:var(--color-text-secondary)]">
                      {f.error}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onReset}>
          Importar otro archivo
        </Button>
        <Button asChild>
          <Link href="/recipes">Ver recetas</Link>
        </Button>
      </div>
    </div>
  )
}

function downloadErrorsCsv(result: ImportResult) {
  const header = 'tipo,fila,nombre,error\n'
  const rows = result.failed.map((f) =>
    [f.kind, f.row_index, escapeCsv(f.name), escapeCsv(f.error)].join(',')
  )
  const csv = header + rows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  // Security: Ensure the URL strictly uses the blob protocol to prevent potential XSS
  // if generation logic changes in the future
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'blob:') {
      URL.revokeObjectURL(url)
      return
    }
  } catch {
    URL.revokeObjectURL(url)
    return
  }

  const link = document.createElement('a')
  link.href = url
  link.download = `import-errores-${result.run_id}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
