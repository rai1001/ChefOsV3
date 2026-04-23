import { describe, it, expect } from 'vitest'
import { toSlug } from './slug-utils'

describe('toSlug', () => {
  it('convierte mayúsculas a minúsculas y reemplaza espacios por guiones', () => {
    expect(toSlug('Hotel Plaza Mayor')).toBe('hotel-plaza-mayor')
  })

  it('elimina tildes y diacríticos', () => {
    expect(toSlug('Árbol Ñandú Café')).toBe('arbol-nandu-cafe')
  })

  it('elimina caracteres no alfanuméricos', () => {
    expect(toSlug('  Hotel *** Plaza !!! ')).toBe('hotel-plaza')
  })

  it('recorta guiones al inicio y al final', () => {
    expect(toSlug('---Hotel---Plaza---')).toBe('hotel-plaza')
  })

  it('devuelve cadena vacía si solo contiene caracteres no válidos', () => {
    expect(toSlug('!!!')).toBe('')
    expect(toSlug('***')).toBe('')
  })

  it('limita el resultado a 48 caracteres', () => {
    const longString = 'este es un texto exageradamente largo que deberia ser cortado despues de cuarenta y ocho caracteres'
    // La longitud sin recortar seria > 48, deberia cortarse a 48.
    const expected = 'este-es-un-texto-exageradamente-largo-que-deberi'

    expect(toSlug(longString)).toBe(expected)
    expect(toSlug(longString).length).toBe(48)
  })

  it('el recorte a 48 caracteres ocurre después de quitar los guiones iniciales y finales, por lo que el resultado puede terminar en guion', () => {
    // Si preparamos una cadena que justo en el carácter 48 (índice 47) tiene un espacio o un guion
    // antes de ser recortada, va a quedar con un guion al final.
    // 47 caracteres seguidos, un espacio, y luego más caracteres.
    const longStringWithSpaceAt48 = '12345678901234567890123456789012345678901234567 90'
    const expected = '12345678901234567890123456789012345678901234567-'

    expect(toSlug(longStringWithSpaceAt48)).toBe(expected)
    expect(toSlug(longStringWithSpaceAt48).length).toBe(48)
  })

  it('ignora o elimina emojis', () => {
    expect(toSlug('Hola 🌎 Mundo 😊')).toBe('hola-mundo')
  })
})
