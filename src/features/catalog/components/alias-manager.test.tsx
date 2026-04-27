import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest'
import { AliasManager } from './alias-manager'
import { useAddAlias, useProductAliases, useRemoveAlias } from '../application/use-product-aliases'

// Mock de los hooks de la capa de aplicación
vi.mock('../application/use-product-aliases', () => ({
  useProductAliases: vi.fn(),
  useAddAlias: vi.fn(),
  useRemoveAlias: vi.fn(),
}))

describe('AliasManager', () => {
  const mockHotelId = 'hotel-123'
  const mockProductId = 'prod-456'

  let mutateAsyncMock: Mock
  let mutateMock: Mock

  beforeEach(() => {
    vi.clearAllMocks()

    // Comportamiento por defecto de los mocks
    vi.mocked(useProductAliases).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)

    mutateAsyncMock = vi.fn()
    vi.mocked(useAddAlias).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
      error: null,
    } as any)

    mutateMock = vi.fn()
    vi.mocked(useRemoveAlias).mockReturnValue({
      mutate: mutateMock,
      isPending: false,
    } as any)
  })

  it('debe registrar un error en la consola si la mutacion de añadir falla', async () => {
    const user = userEvent.setup()

    // Configurar el error esperado
    const expectedError = new Error('Error al añadir alias')
    mutateAsyncMock.mockRejectedValueOnce(expectedError)

    // Espiar console.error y silenciarlo
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<AliasManager hotelId={mockHotelId} productId={mockProductId} />)

    // Escribir un alias en el input
    const input = screen.getByPlaceholderText(/Nuevo alias/i)
    await user.type(input, 'tomate rojo')

    // Hacer clic en "Añadir"
    const button = screen.getByRole('button', { name: /Añadir/i })
    await user.click(button)

    // Verificar que mutateAsync fue llamado
    expect(mutateAsyncMock).toHaveBeenCalledWith({
      hotel_id: mockHotelId,
      product_id: mockProductId,
      alias_name: 'tomate rojo',
      source_type: 'manual',
      confidence_score: 1.0,
    })

    // Verificar que console.error fue llamado con el error correcto (el bloque catch)
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(expectedError)
    })

    // Restaurar console.error
    consoleErrorSpy.mockRestore()
  })

  it('debe no hacer nada si el input esta vacio', async () => {
    const user = userEvent.setup()

    render(<AliasManager hotelId={mockHotelId} productId={mockProductId} />)

    // Hacer clic en "Añadir" directamente con input vacio (el boton deberia estar deshabilitado)
    const button = screen.getByRole('button', { name: /Añadir/i })
    expect(button).toBeDisabled()

    await user.click(button)

    // Verificar que mutateAsync NO fue llamado
    expect(mutateAsyncMock).not.toHaveBeenCalled()
  })

  it('debe llamar a mutateAsync y limpiar el input en un caso de exito (presionando Enter)', async () => {
    const user = userEvent.setup()

    mutateAsyncMock.mockResolvedValueOnce({
      id: 'alias-1',
      hotel_id: mockHotelId,
      product_id: mockProductId,
      alias_name: 'tomate rojo',
      source_type: 'manual',
      confidence_score: 1.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    render(<AliasManager hotelId={mockHotelId} productId={mockProductId} />)

    // Escribir un alias en el input
    const input = screen.getByPlaceholderText(/Nuevo alias/i)
    await user.type(input, 'tomate azul{enter}')

    // Verificar que mutateAsync fue llamado
    expect(mutateAsyncMock).toHaveBeenCalledWith({
      hotel_id: mockHotelId,
      product_id: mockProductId,
      alias_name: 'tomate azul',
      source_type: 'manual',
      confidence_score: 1.0,
    })

    // El input deberia vaciarse
    await waitFor(() => {
      expect(input).toHaveValue('')
    })
  })

  it('debe mostrar la lista de alias, permitir borrar, y mostrar mensaje cargando', async () => {
    const user = userEvent.setup()

    vi.mocked(useProductAliases).mockReturnValue({
      data: [
        {
          id: 'alias-1',
          hotel_id: mockHotelId,
          product_id: mockProductId,
          alias_name: 'tomate verde',
          source_type: 'manual',
          confidence_score: 1.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ],
      isLoading: false,
    } as any)

    render(<AliasManager hotelId={mockHotelId} productId={mockProductId} />)

    // Verificar que se renderiza el alias
    expect(screen.getByText('tomate verde')).toBeInTheDocument()

    // Hacer click en borrar
    const deleteButton = screen.getByRole('button', { name: /Borrar/i })
    await user.click(deleteButton)

    expect(mutateMock).toHaveBeenCalledWith({
      hotelId: mockHotelId,
      aliasId: 'alias-1'
    })
  })

  it('debe manejar estado vacio (isLoading: true y empty data)', async () => {
    vi.mocked(useProductAliases).mockReturnValue({
      data: [],
      isLoading: true,
    } as any)

    render(<AliasManager hotelId={mockHotelId} productId={mockProductId} />)
    expect(screen.getByText('Cargando alias…')).toBeInTheDocument()

    // Vaciar datos, no cargando
    vi.mocked(useProductAliases).mockReturnValue({
      data: [],
      isLoading: false,
    } as any)

    // re-render para mostrar estado vacío
    render(<AliasManager hotelId={mockHotelId} productId={mockProductId} />)
    expect(screen.getByText(/No hay alias aún/i)).toBeInTheDocument()
  })

  it('debe mostrar error de react-query si add.error esta definido', async () => {
    vi.mocked(useAddAlias).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
      error: new Error('Error al conectar con servidor'),
    } as any)

    render(<AliasManager hotelId={mockHotelId} productId={mockProductId} />)

    expect(screen.getByText('Error al conectar con servidor')).toBeInTheDocument()
  })

  it('debe abortar handleAdd tempranamente si el texto esta vacio o solo son espacios (verificando keyDown Enter sin input)', async () => {
    const user = userEvent.setup()
    render(<AliasManager hotelId={mockHotelId} productId={mockProductId} />)

    const input = screen.getByPlaceholderText(/Nuevo alias/i)

    // Escribir solo espacios
    await user.type(input, '   {enter}')

    // mutateAsyncMock no debería ser llamado debido al if (!trimmed) return
    expect(mutateAsyncMock).not.toHaveBeenCalled()
  })

  it('debe hacer fallback al source_type si no hay etiqueta en ALIAS_SOURCE_LABELS', async () => {
    vi.mocked(useProductAliases).mockReturnValue({
      data: [
        {
          id: 'alias-unknown',
          hotel_id: mockHotelId,
          product_id: mockProductId,
          alias_name: 'tomate desconocido',
          source_type: 'unknown_source' as any,
          confidence_score: 0.5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ],
      isLoading: false,
    } as any)

    render(<AliasManager hotelId={mockHotelId} productId={mockProductId} />)

    // Debería renderizarse el source_type en bruto: "unknown_source · confianza 50%"
    expect(screen.getByText(/unknown_source · confianza 50%/i)).toBeInTheDocument()
  })
})
