import { describe, expect, it } from 'vitest'
import { formatCsv } from './csv'

describe('formatCsv', () => {
  it('incluye BOM UTF-8 y escapa comillas, separador y saltos de línea', () => {
    const csv = formatCsv({
      columns: [
        { key: 'name', header: 'Nombre' },
        { key: 'notes', header: 'Notas' },
      ],
      rows: [
        {
          name: 'Tomate, pera',
          notes: 'Dice "maduro"\ny fresco',
        },
      ],
    })

    expect(csv.charCodeAt(0)).toBe(0xfeff)
    expect(csv).toContain('"Tomate, pera"')
    expect(csv).toContain('"Dice ""maduro""\ny fresco"')
  })

  it('serializa null y undefined como celda vacía', () => {
    const csv = formatCsv({
      columns: [
        { key: 'name', header: 'Nombre' },
        { key: 'value', header: 'Valor' },
      ],
      rows: [{ name: 'Sin dato', value: null }],
    })

    expect(csv.trimEnd()).toBe('\ufeffNombre,Valor\r\nSin dato,')
  })
})
