export interface CsvColumn<Row extends object> {
  key: keyof Row
  header: string
}

export interface CsvFormatInput<Row extends object> {
  columns: CsvColumn<Row>[]
  rows: Row[]
}

function serializeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return ''

  const serialized =
    value instanceof Date
      ? value.toISOString()
      : typeof value === 'number' || typeof value === 'boolean'
        ? String(value)
        : String(value)

  const formulaHardened = shouldHardenCsvFormula(serialized)
    ? `'${serialized}`
    : serialized

  if (/[",\r\n]/.test(formulaHardened)) {
    return `"${formulaHardened.replaceAll('"', '""')}"`
  }

  return formulaHardened
}

function shouldHardenCsvFormula(value: string): boolean {
  if (/^[\t ]*[=+@]/.test(value)) return true
  if (!/^[\t ]*-/.test(value)) return false

  return !/^[\t ]*-\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[\t ]*$/.test(value)
}

export function formatCsv<Row extends object>({
  columns,
  rows,
}: CsvFormatInput<Row>): string {
  const header = columns.map((column) => serializeCsvValue(column.header)).join(',')
  const body = rows.map((row) =>
    columns.map((column) => serializeCsvValue(row[column.key])).join(',')
  )

  return `\ufeff${[header, ...body].join('\r\n')}`
}
