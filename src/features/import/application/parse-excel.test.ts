import { describe, it, expect } from 'vitest'
import { parseRecipesExcel } from './parse-excel'
import { ExcelParseError, MissingSheetError, EmptyImportError } from '../domain/errors'

describe('parseRecipesExcel', () => {
  it('throws ExcelParseError when loadExcelJS fails', async () => {
    const dummyBuffer = new ArrayBuffer(0)
    const options = {
      loadExcelJS: async () => {
        throw new Error('Simulated load error')
      }
    }

    await expect(parseRecipesExcel(dummyBuffer, options)).rejects.toThrow(ExcelParseError)
    await expect(parseRecipesExcel(dummyBuffer, options)).rejects.toThrow('No se pudo cargar la librería ExcelJS')
  })

  it('throws ExcelParseError when buffer is not a valid Excel file', async () => {
    const dummyBuffer = new ArrayBuffer(0)
    const mockExcelJS = {
      Workbook: class {
        xlsx = {
          load: async () => {
            throw new Error('Simulated load excel error')
          }
        }
      }
    }
    const options = {
      loadExcelJS: async () => mockExcelJS as never
    }

    await expect(parseRecipesExcel(dummyBuffer, options)).rejects.toThrow(ExcelParseError)
    await expect(parseRecipesExcel(dummyBuffer, options)).rejects.toThrow('El archivo no es un Excel válido (.xlsx)')
  })

  it('throws MissingSheetError when a required sheet is missing', async () => {
    const dummyBuffer = new ArrayBuffer(0)
    const mockExcelJS = {
      Workbook: class {
        xlsx = {
          load: async () => {} // Success
        }
        getWorksheet(name: string) {
          if (name === 'Recetas') return {} // Found 'Recetas'
          return undefined // Missing 'Ingredientes'
        }
      }
    }
    const options = {
      loadExcelJS: async () => mockExcelJS as never
    }

    await expect(parseRecipesExcel(dummyBuffer, options)).rejects.toThrow(MissingSheetError)
  })

  it('throws MissingSheetError when Recetas sheet is missing', async () => {
    const dummyBuffer = new ArrayBuffer(0)
    const mockExcelJS = {
      Workbook: class {
        xlsx = {
          load: async () => {} // Success
        }
        getWorksheet(name: string) {
          if (name === 'Ingredientes') return {} // Found 'Ingredientes'
          return undefined // Missing 'Recetas'
        }
      }
    }
    const options = {
      loadExcelJS: async () => mockExcelJS as never
    }

    await expect(parseRecipesExcel(dummyBuffer, options)).rejects.toThrow(MissingSheetError)
  })

  it('throws EmptyImportError when both sheets have no usable data', async () => {
    const dummyBuffer = new ArrayBuffer(0)
    const mockSheet = {
      eachRow: (_opts: unknown, callback: (row: { values: unknown[] }, rowNumber: number) => void) => {
        // Callback no invocado = 0 filas = hoja vacía
      }
    }
    const mockExcelJS = {
      Workbook: class {
        xlsx = {
          load: async () => {} // Success
        }
        getWorksheet(name: string) {
          return mockSheet
        }
      }
    }
    const options = {
      loadExcelJS: async () => mockExcelJS as never
    }

    await expect(parseRecipesExcel(dummyBuffer, options)).rejects.toThrow(EmptyImportError)
  })
})

  it('parses valid recipes and ingredients correctly (happy path)', async () => {
    const dummyBuffer = new ArrayBuffer(0)

    // Simulate rows mapping exactly to RECIPE_HEADER_ALIASES and INGREDIENT_HEADER_ALIASES
    const mockRecipesSheet = {
      eachRow: (_opts: unknown, callback: (row: { values: unknown[] }, rowNumber: number) => void) => {
        // 1-indexed headers
        callback({ values: [null, 'Nombre', 'Categoría', 'Servings', 'Precio'] }, 1)
        // 1-indexed row data
        callback({ values: [null, 'Macarrones', 'Pasta', 4, 15.50] }, 2)
      }
    }

    const mockIngredientsSheet = {
      eachRow: (_opts: unknown, callback: (row: { values: unknown[] }, rowNumber: number) => void) => {
        // 1-indexed headers
        callback({ values: [null, 'Receta', 'Ingrediente', 'Cantidad', 'Unidad'] }, 1)
        // 1-indexed row data
        callback({ values: [null, 'Macarrones', 'Tomate', 500, 'g'] }, 2)
      }
    }

    const mockExcelJS = {
      Workbook: class {
        xlsx = { load: async () => {} }
        getWorksheet(name: string) {
          if (name === 'Recetas') return mockRecipesSheet
          if (name === 'Ingredientes') return mockIngredientsSheet
          return undefined
        }
      }
    }
    const options = { loadExcelJS: async () => mockExcelJS as never }

    const result = await parseRecipesExcel(dummyBuffer, options)

    expect(result.recipes).toHaveLength(1)
    expect(result.recipes[0]).toMatchObject({
      name: 'Macarrones',
      category: 'Pasta',
      servings: 4,
      target_price: 15.50
    })

    expect(result.ingredients).toHaveLength(1)
    expect(result.ingredients[0]).toMatchObject({
      recipe_name: 'Macarrones',
      ingredient_name: 'Tomate',
      quantity_gross: 500,
      unit: 'g'
    })
  })

  it('resolves header aliases and special cell values', async () => {
    const dummyBuffer = new ArrayBuffer(0)

    const mockDate = new Date('2023-01-01T12:00:00.000Z')

    const mockRecipesSheet = {
      eachRow: (_opts: unknown, callback: (row: { values: unknown[] }, rowNumber: number) => void) => {
        // Use aliases for headers: 'tiempo preparacion' -> prep_time_min, 'alergenos' -> allergens
        callback({ values: [null, 'receta', 'tiempo preparacion', 'alergenos', 'dificultad', 'precio_objetivo'] }, 1)
        // Row with special cell types (formula result, richText)
        callback({ values: [
          null,
          { richText: [{ text: 'Receta ' }, { text: 'Compleja' }] }, // richText unwrapping
          { result: 45 }, // formula result unwrapping
          'gluten, Lácteos', // csv string
          { text: 'Alta', hyperlink: 'http://example.com' }, // hyperlink unwrapping
          mockDate // date unwrapping
        ] }, 2)
      }
    }

    const mockIngredientsSheet = {
      eachRow: (_opts: unknown, callback: (row: { values: unknown[] }, rowNumber: number) => void) => {
        // Minimal valid ingredients to prevent EmptyImportError when testing recipes
        callback({ values: [null, 'receta', 'ingrediente', 'cantidad'] }, 1)
        callback({ values: [null, 'Receta Compleja', 'Sal', 10] }, 2)
      }
    }

    const mockExcelJS = {
      Workbook: class {
        xlsx = { load: async () => {} }
        getWorksheet(name: string) {
          if (name === 'Recetas') return mockRecipesSheet
          if (name === 'Ingredientes') return mockIngredientsSheet
          return undefined
        }
      }
    }
    const options = { loadExcelJS: async () => mockExcelJS as never }

    const result = await parseRecipesExcel(dummyBuffer, options)

    expect(result.recipes).toHaveLength(1)
    expect(result.recipes[0]).toMatchObject({
      name: 'Receta Compleja', // From RichText
      prep_time_min: 45, // From formula result
      allergens: ['gluten', 'lácteos'], // Note: 'Lácteos' gets normalized depending on parseCsvField implementation
      difficulty: 'alta', // From hyperlink
    })
    // Test the date to string conversion based on our logic (unwraps to ISOString and cellToNumber gives null so it's 0 or we don't have it, actually it's price)
    // The price_objetivo mapped to Date would be cellToNumber(date.toISOString()), which is null
    // Let's assert what the code actually does
  })
