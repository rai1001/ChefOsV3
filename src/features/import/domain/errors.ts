// Errores de dominio para `import` (sprint-03c, ADR-0013).

export class ExcelParseError extends Error {
  readonly code = 'EXCEL_PARSE_ERROR' as const
  override readonly cause?: unknown
  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'ExcelParseError'
    this.cause = cause
  }
}

export class MissingSheetError extends Error {
  readonly code = 'MISSING_SHEET' as const
  constructor(public readonly sheetName: string) {
    super(`Falta la hoja "${sheetName}" en el Excel.`)
    this.name = 'MissingSheetError'
  }
}

export class EmptyImportError extends Error {
  readonly code = 'EMPTY_IMPORT' as const
  constructor(message = 'El Excel no contiene filas para importar') {
    super(message)
    this.name = 'EmptyImportError'
  }
}

export class ImportRunNotFoundError extends Error {
  readonly code = 'IMPORT_RUN_NOT_FOUND' as const
  constructor(public readonly runId: string) {
    super(`Import run no encontrado: ${runId}`)
    this.name = 'ImportRunNotFoundError'
  }
}
