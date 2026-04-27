import { getActiveHotelOrNull } from '@/features/identity/server'
import {
  rangeFromSearchParams,
  topProductsDimensionSchema,
  urlSearchParamsFromRecord,
} from '@/features/reporting'
import { ReportHeader } from '@/features/reporting/components/report-ui'
import { TopProductsReport } from '@/features/reporting/components/top-products-report'

export const dynamic = 'force-dynamic'

export default async function TopProductsReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [rawSearchParams, activeHotel] = await Promise.all([
    searchParams,
    getActiveHotelOrNull(),
  ])
  if (!activeHotel) return null

  const params = urlSearchParamsFromRecord(rawSearchParams)
  const range = rangeFromSearchParams(params)
  const parsedDimension = topProductsDimensionSchema.safeParse(params.get('dimension'))
  const dimension = parsedDimension.success ? parsedDimension.data : 'consumed_value'

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <ReportHeader title="Top productos" hotelName={activeHotel.hotel_name} />
        <TopProductsReport
          hotelId={activeHotel.hotel_id}
          range={range}
          dimension={dimension}
          categoryId={params.get('categoryId') ?? undefined}
        />
      </div>
    </main>
  )
}
