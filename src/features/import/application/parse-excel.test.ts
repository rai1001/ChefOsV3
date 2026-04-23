import { describe, it, expect, vi } from 'vitest'
import { parseRecipesExcel } from './parse-excel'
import { ExcelParseError } from '../domain/errors'

describe('parseRecipesExcel', () => {
  it('debe rechazar con ExcelParseError si loadExcelJS falla, preservando el error original', async () => {
    const originalError = new Error('boom')
    const mockLoadExcelJS = vi.fn().mockRejectedValue(originalError)
    const emptyBuffer = new ArrayBuffer(0)

    let caughtError: unknown
    try {
      await parseRecipesExcel(emptyBuffer, { loadExcelJS: mockLoadExcelJS })
    } catch (err) {
      caughtError = err
    }

    expect(caughtError).toBeInstanceOf(ExcelParseError)
    expect((caughtError as ExcelParseError).message).toBe('No se pudo cargar la librería ExcelJS')
    expect((caughtError as ExcelParseError).cause).toBe(originalError)
    expect(mockLoadExcelJS).toHaveBeenCalledTimes(1)
  })
})
