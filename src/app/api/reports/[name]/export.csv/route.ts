import type { SupabaseClient } from '@supabase/supabase-js'
import { getActiveHotelOrNull } from '@/features/identity/server'
import type { Role } from '@/features/identity'
import {
  rangeFromSearchParams,
  topProductsDimensionSchema,
} from '@/features/reporting'
import {
  fetchFoodCostReport,
  fetchPriceChangesReport,
  fetchTopProductsReport,
  fetchWasteReport,
  formatFoodCostCsv,
  formatPriceChangesCsv,
  formatTopProductsCsv,
  formatWasteCsv,
  isCsvReportName,
  type CsvReportName,
} from '@/features/reporting/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const REPORTING_ROLES: readonly Role[] = [
  'direction',
  'admin',
  'head_chef',
  'sous_chef',
  'procurement',
]

const MAX_EXPORT_ROWS = 10_000

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params
  if (!isCsvReportName(name)) {
    return new Response('Unknown report', { status: 404 })
  }

  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (!REPORTING_ROLES.includes(activeHotel.role)) {
    return new Response('Forbidden', { status: 403 })
  }

  const searchParams = new URL(request.url).searchParams
  const range = rangeFromSearchParams(searchParams)
  const supabase = await createClient()
  const csv = await buildReportCsv({
    name,
    supabase,
    hotelId: activeHotel.hotel_id,
    from: range.from,
    to: range.to,
    searchParams,
  })

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="chefos-${name}-${range.from}-${range.to}.csv"`,
      'Cache-Control': 'private, max-age=0, must-revalidate',
    },
  })
}

async function buildReportCsv({
  name,
  supabase,
  hotelId,
  from,
  to,
  searchParams,
}: {
  name: CsvReportName
  supabase: SupabaseClient
  hotelId: string
  from: string
  to: string
  searchParams: URLSearchParams
}): Promise<string> {
  if (name === 'food-cost') {
    const rows = await fetchFoodCostReport(supabase, { hotelId, from, to })
    return formatFoodCostCsv(rows.slice(0, MAX_EXPORT_ROWS))
  }

  if (name === 'waste') {
    const rows = await fetchWasteReport(supabase, {
      hotelId,
      from,
      to,
      productId: searchParams.get('productId') ?? undefined,
      categoryId: searchParams.get('categoryId') ?? undefined,
    })
    return formatWasteCsv(rows.slice(0, MAX_EXPORT_ROWS))
  }

  if (name === 'top-products') {
    const dimension = topProductsDimensionSchema.parse(
      searchParams.get('dimension') ?? 'consumed_value'
    )
    const rows = await fetchTopProductsReport(supabase, {
      hotelId,
      from,
      to,
      dimension,
      categoryId: searchParams.get('categoryId') ?? undefined,
      limit: 100,
    })
    return formatTopProductsCsv(rows.slice(0, MAX_EXPORT_ROWS))
  }

  const rows = await fetchPriceChangesReport(supabase, {
    hotelId,
    from,
    to,
    supplierId: searchParams.get('supplierId') ?? undefined,
    productId: searchParams.get('productId') ?? undefined,
    limit: 200,
  })
  return formatPriceChangesCsv(rows.slice(0, MAX_EXPORT_ROWS))
}
