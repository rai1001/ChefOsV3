import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ImportResultSummary } from './import-result-summary'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('ImportResultSummary', () => {
  it('neutraliza prefijos de formula al exportar errores CSV', async () => {
    const user = userEvent.setup()
    let csvContent = ''

    const createObjectURL = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation((blob: Blob | MediaSource) => {
        if (blob instanceof Blob) {
          void blob.text().then((text) => {
            csvContent = text
          })
        }
        return 'blob:https://example.com/errors'
      })

    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    const result = {
      run_id: 'run-1',
      ok_count: 1,
      failed_count: 1,
      failed: [
        {
          kind: 'recipe' as const,
          row_index: 2,
          name: '=2+3',
          error: '@SUM(1,1)',
        },
      ],
    }

    render(<ImportResultSummary result={result} onReset={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Descargar CSV' }))

    await vi.waitFor(() => {
      expect(csvContent).toContain("'=")
      expect(csvContent).toContain("'@")
    })

    createObjectURL.mockRestore()
    revokeObjectURL.mockRestore()
  })
})
