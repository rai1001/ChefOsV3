import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import {
  TOP_PRODUCTS_DIMENSIONS,
  type ReportBaseFilter,
  type ReportPriceChangesFilter,
  type ReportProductFilter,
  type ReportTopProductsFilter,
} from '../domain/filters'
import { reportDateRangeToRpc } from '../domain/filters'
import {
  foodCostReportSchema,
  type FoodCostReportRow,
} from '../domain/food-cost'
import {
  priceChangesReportSchema,
  type PriceChangeReportRow,
} from '../domain/price-changes'
import { ReportInvalidDimensionError } from '../domain/errors'
import {
  stockHealthReportSchema,
  type StockHealthReport,
} from '../domain/stock-health'
import {
  topProductsReportSchema,
  type TopProductReportRow,
} from '../domain/top-products'
import { wasteReportSchema, type WasteReportRow } from '../domain/waste'

interface SupabaseErrorLike {
  code?: string
  message?: string
}

function isErrorLike(error: unknown): error is SupabaseErrorLike {
  return error !== null && typeof error === 'object'
}

function mapReportingError(error: unknown, dimension?: string): never {
  if (isErrorLike(error) && error.code === 'P0003' && dimension) {
    throw new ReportInvalidDimensionError(dimension, TOP_PRODUCTS_DIMENSIONS, error.message)
  }

  throw mapSupabaseError(error, { resource: 'reporting' })
}

export async function fetchFoodCostReport(
  supabase: SupabaseClient,
  filter: ReportBaseFilter & { recipeId?: string }
): Promise<FoodCostReportRow[]> {
  const range = reportDateRangeToRpc(filter)
  const { data, error } = await supabase.rpc('v3_report_food_cost_by_recipe', {
    p_hotel_id: filter.hotelId,
    p_from: range.p_from,
    p_to: range.p_to,
    p_recipe_id: filter.recipeId ?? undefined,
  })

  if (error) mapReportingError(error)
  return foodCostReportSchema.parse(data ?? [])
}

export async function fetchWasteReport(
  supabase: SupabaseClient,
  filter: ReportProductFilter
): Promise<WasteReportRow[]> {
  const range = reportDateRangeToRpc(filter)
  const { data, error } = await supabase.rpc('v3_report_waste_by_period', {
    p_hotel_id: filter.hotelId,
    p_from: range.p_from,
    p_to: range.p_to,
    p_product_id: filter.productId ?? undefined,
  })

  if (error) mapReportingError(error)
  const rows = wasteReportSchema.parse(data ?? [])
  return filter.categoryId
    ? rows.filter((row) => row.category_id === filter.categoryId)
    : rows
}

export async function fetchTopProductsReport(
  supabase: SupabaseClient,
  filter: ReportTopProductsFilter
): Promise<TopProductReportRow[]> {
  const range = reportDateRangeToRpc(filter)
  const { data, error } = await supabase.rpc('v3_report_top_products', {
    p_hotel_id: filter.hotelId,
    p_from: range.p_from,
    p_to: range.p_to,
    p_dimension: filter.dimension,
    p_limit: filter.limit,
  })

  if (error) mapReportingError(error, filter.dimension)
  const rows = topProductsReportSchema.parse(data ?? [])
  return filter.categoryId
    ? rows.filter((row) => row.category_id === filter.categoryId)
    : rows
}

export async function fetchPriceChangesReport(
  supabase: SupabaseClient,
  filter: ReportPriceChangesFilter & { limit?: number }
): Promise<PriceChangeReportRow[]> {
  const range = reportDateRangeToRpc(filter)
  const { data, error } = await supabase.rpc('v3_report_price_changes', {
    p_hotel_id: filter.hotelId,
    p_from: range.p_from,
    p_to: range.p_to,
    p_supplier_id: filter.supplierId ?? undefined,
    p_product_id: filter.productId ?? undefined,
    p_limit: filter.limit ?? 200,
  })

  if (error) mapReportingError(error)
  return priceChangesReportSchema.parse(data ?? [])
}

export async function fetchStockHealthReport(
  supabase: SupabaseClient,
  hotelId: string
): Promise<StockHealthReport> {
  const { data, error } = await supabase.rpc('v3_report_stock_health', {
    p_hotel_id: hotelId,
  })

  if (error) mapReportingError(error)
  return stockHealthReportSchema.parse(data)
}
