import { getActiveHotelOrNull } from '@/features/identity/server'
import {
  rangeFromSearchParams,
  urlSearchParamsFromRecord,
} from '@/features/reporting'
import { ReportHeader } from '@/features/reporting/components/report-ui'
import { WasteReport } from '@/features/reporting/components/waste-report'

export const dynamic = 'force-dynamic'

export default async function WasteReportPage({
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
        <ReportHeader title="Mermas" hotelName={activeHotel.hotel_name} />
        <WasteReport
          hotelId={activeHotel.hotel_id}
          range={range}
          categoryId={params.get('categoryId') ?? undefined}
        />
      </div>
    </main>
  )
}
