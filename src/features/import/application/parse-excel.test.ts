import { describe, expect, it, vi } from 'vitest'
import { parseRecipesExcel } from './parse-excel'
import {
  EmptyImportError,
  ExcelParseError,
  MissingSheetError,
} from '../domain/errors'

describe('parseRecipesExcel', () => {
  const mockBuffer = new ArrayBuffer(0)
  const createOptions = (mockWorkbook: unknown) => ({
    loadExcelJS: async () => {
      function MockWorkbook() {
        return mockWorkbook
      }

      return {
        Workbook: MockWorkbook as any,
      }
    },
  })

  it('throws ExcelParseError when ExcelJS fails to load', async () => {
    const options = {
      loadExcelJS: async () => {
        throw new Error('Load failed')
      },
    }

    await expect(parseRecipesExcel(mockBuffer, options)).rejects.toThrow(
      ExcelParseError
    )
    await expect(parseRecipesExcel(mockBuffer, options)).rejects.toThrow(
      'No se pudo cargar la librería ExcelJS'
    )
  })

  it('throws ExcelParseError when workbook fails to load (invalid buffer)', async () => {
    const mockWorkbook = {
      xlsx: {
        load: vi.fn().mockRejectedValue(new Error('Invalid buffer')),
      },
    }
    const options = createOptions(mockWorkbook)

    await expect(parseRecipesExcel(mockBuffer, options)).rejects.toThrow(
      ExcelParseError
    )
    await expect(parseRecipesExcel(mockBuffer, options)).rejects.toThrow(
      'El archivo no es un Excel válido (.xlsx)'
    )
  })

  it("throws MissingSheetError when 'Recetas' sheet is missing", async () => {
    const mockWorkbook = {
      xlsx: {
        load: vi.fn().mockResolvedValue(undefined),
      },
      getWorksheet: vi.fn().mockImplementation((name) => {
        if (name === 'Recetas') return null
        return {}
      }),
    }
    const options = createOptions(mockWorkbook)

    await expect(parseRecipesExcel(mockBuffer, options)).rejects.toThrow(
      MissingSheetError
    )
    await expect(parseRecipesExcel(mockBuffer, options)).rejects.toThrow(
      'Falta la hoja "Recetas" en el Excel.'
    )
  })

  it("throws MissingSheetError when 'Ingredientes' sheet is missing", async () => {
    const mockWorkbook = {
      xlsx: {
        load: vi.fn().mockResolvedValue(undefined),
      },
      getWorksheet: vi.fn().mockImplementation((name) => {
        if (name === 'Ingredientes') return null
        return {}
      }),
    }
    const options = createOptions(mockWorkbook)

    await expect(parseRecipesExcel(mockBuffer, options)).rejects.toThrow(
      MissingSheetError
    )
    await expect(parseRecipesExcel(mockBuffer, options)).rejects.toThrow(
      'Falta la hoja "Ingredientes" en el Excel.'
    )
  })

  it('throws EmptyImportError when both sheets are empty', async () => {
    const mockSheet = {
      eachRow: vi.fn(),
    }
    const mockWorkbook = {
      xlsx: {
        load: vi.fn().mockResolvedValue(undefined),
      },
      getWorksheet: vi.fn().mockReturnValue(mockSheet),
    }
    const options = createOptions(mockWorkbook)

    await expect(parseRecipesExcel(mockBuffer, options)).rejects.toThrow(
      EmptyImportError
    )
  })

  it('happy path: parses a valid excel buffer correctly', async () => {
    const mockRecipesSheet = {
      eachRow: vi.fn((opts, cb) => {
        cb({ values: [null, 'Nombre', 'Categoría', 'Raciones'] }, 1)
        cb({ values: [null, 'Pollo Asado', 'Principal', 4] }, 2)
      }),
    }
    const mockIngredientsSheet = {
      eachRow: vi.fn((opts, cb) => {
        cb({ values: [null, 'Receta', 'Ingrediente', 'Cantidad Bruta'] }, 1)
        cb({ values: [null, 'Pollo Asado', 'Pollo', 1] }, 2)
      }),
    }
    const mockWorkbook = {
      xlsx: {
        load: vi.fn().mockResolvedValue(undefined),
      },
      getWorksheet: vi.fn().mockImplementation((name) => {
        if (name === 'Recetas') return mockRecipesSheet
        if (name === 'Ingredientes') return mockIngredientsSheet
        return null
      }),
    }
    const options = createOptions(mockWorkbook)

    const result = await parseRecipesExcel(mockBuffer, options)

    expect(result.recipes).toHaveLength(1)
    expect(result.recipes[0].name).toBe('Pollo Asado')
    expect(result.ingredients).toHaveLength(1)
    expect(result.ingredients[0].ingredient_name).toBe('Pollo')
  })
})
