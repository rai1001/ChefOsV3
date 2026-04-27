import { getActiveHotelOrNull } from '@/features/identity/server'
import {
  rangeFromSearchParams,
  urlSearchParamsFromRecord,
} from '@/features/reporting'
import { PriceChangesReport } from '@/features/reporting/components/price-changes-report'
import { ReportHeader } from '@/features/reporting/components/report-ui'

export const dynamic = 'force-dynamic'

export default async function PriceChangesReportPage({
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

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <ReportHeader title="Variación de precio" hotelName={activeHotel.hotel_name} />
        <PriceChangesReport
          hotelId={activeHotel.hotel_id}
          range={range}
          supplierId={params.get('supplierId') ?? undefined}
          productId={params.get('productId') ?? undefined}
        />
      </div>
    </main>
  )
}
