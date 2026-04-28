import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProducts } from '@/features/catalog'
import { useProductLots } from '@/features/inventory'
import { useTransferLot } from '../application/use-transfer-lot'
import { useWarehouses } from '../application/use-warehouses'
import { TransferLotForm } from './transfer-lot-form'

vi.mock('@/features/catalog', () => ({
  useProducts: vi.fn(),
}))

vi.mock('@/features/inventory', () => ({
  useProductLots: vi.fn(),
}))

vi.mock('../application/use-transfer-lot', () => ({
  useTransferLot: vi.fn(),
}))

vi.mock('../application/use-warehouses', () => ({
  useWarehouses: vi.fn(),
}))

const hotelId = '11111111-1111-4111-8111-111111111111'
const productId = '22222222-2222-4222-8222-222222222222'
const lotId = '33333333-3333-4333-8333-333333333333'
const fromWarehouseId = '44444444-4444-4444-8444-444444444444'
const toWarehouseId = '55555555-5555-4555-8555-555555555555'

function successQuery<TData>(data: TData): UseQueryResult<TData, Error> {
  return {
    data,
    dataUpdatedAt: Date.now(),
    error: null,
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    isError: false,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isLoading: false,
    isInitialLoading: false,
    isPending: false,
    isLoadingError: false,
    isPaused: false,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
    isSuccess: true,
    isEnabled: true,
    status: 'success',
    fetchStatus: 'idle',
    refetch: vi.fn(),
    promise: Promise.resolve(data),
  }
}

function idleMutation<TData, TVariables>(
  mutateAsync: UseMutationResult<TData, Error, TVariables>['mutateAsync']
): UseMutationResult<TData, Error, TVariables> {
  return {
    context: undefined,
    data: undefined,
    variables: undefined,
    error: null,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    submittedAt: 0,
    isError: false,
    isIdle: true,
    isPending: false,
    isSuccess: false,
    status: 'idle',
    mutate: vi.fn(),
    mutateAsync,
    reset: vi.fn(),
  }
}

describe('TransferLotForm', () => {
  const mutateAsync = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    const productsData: NonNullable<ReturnType<typeof useProducts>['data']> = {
        rows: [
          {
            id: productId,
            hotel_id: hotelId,
            name: 'Tomate pera',
            description: null,
            sku: null,
            category_id: null,
            default_unit_id: null,
            min_stock: null,
            max_stock: null,
            reorder_point: null,
            storage_type: 'refrigerated',
            shelf_life_days: null,
            allergens: [],
            is_active: true,
            created_at: '2026-04-28T10:00:00.000Z',
            updated_at: '2026-04-28T10:00:00.000Z',
          },
        ],
        nextCursor: null,
        pageSize: 200,
    }
    vi.mocked(useProducts).mockReturnValue(successQuery(productsData))

    const lotsData: NonNullable<ReturnType<typeof useProductLots>['data']> = [
        {
          id: lotId,
          hotel_id: hotelId,
          product_id: productId,
          warehouse_id: fromWarehouseId,
          warehouse_name: 'Economato seco',
          goods_receipt_line_id: null,
          quantity_received: 10,
          quantity_remaining: 7,
          unit_id: '66666666-6666-4666-8666-666666666666',
          unit_cost: 2,
          received_at: '2026-04-28T10:00:00.000Z',
          expires_at: null,
          notes: null,
          created_at: '2026-04-28T10:00:00.000Z',
          updated_at: '2026-04-28T10:00:00.000Z',
          product_name: 'Tomate pera',
          product_sku: null,
          unit_name: 'Kilogramo',
          unit_abbreviation: 'kg',
          goods_receipt_id: null,
          lot_number: null,
        },
    ]
    vi.mocked(useProductLots).mockReturnValue(successQuery(lotsData))

    const warehousesData: NonNullable<ReturnType<typeof useWarehouses>['data']> = [
        {
          id: fromWarehouseId,
          hotel_id: hotelId,
          name: 'Economato seco',
          warehouse_type: 'dry',
          is_default: true,
          is_active: true,
          notes: null,
          created_at: '2026-04-28T10:00:00.000Z',
          updated_at: '2026-04-28T10:00:00.000Z',
        },
        {
          id: toWarehouseId,
          hotel_id: hotelId,
          name: 'Cocina fría',
          warehouse_type: 'cold',
          is_default: false,
          is_active: true,
          notes: null,
          created_at: '2026-04-28T10:00:00.000Z',
          updated_at: '2026-04-28T10:00:00.000Z',
        },
    ]
    vi.mocked(useWarehouses).mockReturnValue(successQuery(warehousesData))
    vi.mocked(useTransferLot).mockReturnValue(idleMutation(mutateAsync))
  })

  it('valida cantidad positiva antes de transferir', async () => {
    render(<TransferLotForm hotelId={hotelId} />)

    await userEvent.selectOptions(screen.getByLabelText('Producto'), productId)
    await userEvent.selectOptions(screen.getByLabelText('Lote'), lotId)
    await userEvent.selectOptions(screen.getByLabelText('Destino'), toWarehouseId)
    await userEvent.clear(screen.getByLabelText('Cantidad'))
    await userEvent.type(screen.getByLabelText('Cantidad'), '0')
    await userEvent.click(screen.getByRole('button', { name: /transferir/i }))

    expect(await screen.findByText(/quantity/i)).toBeInTheDocument()
    expect(mutateAsync).not.toHaveBeenCalled()
  })

  it('transfiere un lote al almacén destino', async () => {
    render(<TransferLotForm hotelId={hotelId} />)

    await userEvent.selectOptions(screen.getByLabelText('Producto'), productId)
    await userEvent.selectOptions(screen.getByLabelText('Lote'), lotId)
    await userEvent.selectOptions(screen.getByLabelText('Destino'), toWarehouseId)
    await userEvent.clear(screen.getByLabelText('Cantidad'))
    await userEvent.type(screen.getByLabelText('Cantidad'), '3')
    await userEvent.type(screen.getByLabelText('Notas'), 'Mover para mise en place')
    await userEvent.click(screen.getByRole('button', { name: /transferir/i }))

    expect(mutateAsync).toHaveBeenCalledWith({
      hotel_id: hotelId,
      lot_id: lotId,
      to_warehouse_id: toWarehouseId,
      quantity: 3,
      notes: 'Mover para mise en place',
    })
  })
})
