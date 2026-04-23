import { describe, expect, it, vi } from 'vitest'
import { EmptyImportError, ExcelParseError, MissingSheetError } from '../domain/errors'
import { parseRecipesExcel } from './parse-excel'

type MockSheet = {
  eachRow: (opts: { includeEmpty: boolean }, cb: (row: { values: unknown[] }) => void) => void
}

function createSheet(rows: unknown[][]): MockSheet {
  return {
    eachRow: (_opts, cb) => {
      rows.forEach((row) => cb({ values: [null, ...row] }))
    },
  }
}

function createWorkbookMock(args?: {
  loadError?: unknown
  recipesRows?: unknown[][]
  ingredientsRows?: unknown[][]
  omitRecipesSheet?: boolean
  omitIngredientsSheet?: boolean
}) {
  const recipesSheet = args?.omitRecipesSheet
    ? undefined
    : createSheet(args?.recipesRows ?? [['nombre', 'categoria', 'servings']])

  const ingredientsSheet = args?.omitIngredientsSheet
    ? undefined
    : createSheet(args?.ingredientsRows ?? [['receta_nombre', 'ingrediente', 'cantidad_bruta']])

  class MockWorkbook {
    readonly xlsx = {
      load: vi.fn(async () => {
        if (args?.loadError) throw args.loadError
      }),
    }

    getWorksheet(name: string) {
      if (name === 'Recetas') return recipesSheet
      if (name === 'Ingredientes') return ingredientsSheet
      return undefined
    }
  }

  return MockWorkbook
}

describe('parseRecipesExcel', () => {
  it('wraps exceljs loading failures in ExcelParseError', async () => {
    const loadExcelJS = vi.fn(async () => {
      throw new Error('import failed')
    })

    await expect(parseRecipesExcel(new ArrayBuffer(0), { loadExcelJS })).rejects.toBeInstanceOf(
      ExcelParseError
    )
  })

  it('wraps invalid workbook buffer failures in ExcelParseError', async () => {
    const Workbook = createWorkbookMock({ loadError: new Error('bad xlsx') })

    await expect(
      parseRecipesExcel(new ArrayBuffer(8), {
        loadExcelJS: async () => ({ Workbook } as unknown as typeof import('exceljs')),
      })
    ).rejects.toBeInstanceOf(ExcelParseError)
  })

  it('throws MissingSheetError when Recetas sheet is missing', async () => {
    const Workbook = createWorkbookMock({ omitRecipesSheet: true })

    await expect(
      parseRecipesExcel(new ArrayBuffer(8), {
        loadExcelJS: async () => ({ Workbook } as unknown as typeof import('exceljs')),
      })
    ).rejects.toBeInstanceOf(MissingSheetError)
  })

  it('throws MissingSheetError when Ingredientes sheet is missing', async () => {
    const Workbook = createWorkbookMock({ omitIngredientsSheet: true })

    await expect(
      parseRecipesExcel(new ArrayBuffer(8), {
        loadExcelJS: async () => ({ Workbook } as unknown as typeof import('exceljs')),
      })
    ).rejects.toBeInstanceOf(MissingSheetError)
  })

  it('throws EmptyImportError when both sheets only contain headers', async () => {
    const Workbook = createWorkbookMock({
      recipesRows: [['nombre', 'categoria', 'servings']],
      ingredientsRows: [['receta_nombre', 'ingrediente', 'cantidad_bruta']],
    })

    await expect(
      parseRecipesExcel(new ArrayBuffer(8), {
        loadExcelJS: async () => ({ Workbook } as unknown as typeof import('exceljs')),
      })
    ).rejects.toBeInstanceOf(EmptyImportError)
  })

  it('parses a valid minimal workbook', async () => {
    const Workbook = createWorkbookMock({
      recipesRows: [
        ['nombre', 'categoria', 'servings'],
        ['Paella', 'main', 4],
      ],
      ingredientsRows: [
        ['receta_nombre', 'ingrediente', 'cantidad_bruta', 'unidad'],
        ['Paella', 'Arroz', 300, 'g'],
      ],
    })

    const parsed = await parseRecipesExcel(new ArrayBuffer(8), {
      loadExcelJS: async () => ({ Workbook } as unknown as typeof import('exceljs')),
    })

    expect(parsed.recipes).toHaveLength(1)
    expect(parsed.ingredients).toHaveLength(1)
    expect(parsed.recipes[0]?.name).toBe('Paella')
    expect(parsed.ingredients[0]?.ingredient_name).toBe('Arroz')
  })
})
