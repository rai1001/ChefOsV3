import { getActiveHotelOrNull } from '@/features/identity/server'
import {
  rangeFromSearchParams,
  urlSearchParamsFromRecord,
} from '@/features/reporting'
import { FoodCostReport } from '@/features/reporting/components/food-cost-report'
import { ReportHeader } from '@/features/reporting/components/report-ui'

export const dynamic = 'force-dynamic'

export default async function FoodCostReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [rawSearchParams, activeHotel] = await Promise.all([
    searchParams,
    getActiveHotelOrNull(),
  ])
  if (!activeHotel) return null

  const range = rangeFromSearchParams(urlSearchParamsFromRecord(rawSearchParams))

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <ReportHeader title="Food cost por receta" hotelName={activeHotel.hotel_name} />
        <FoodCostReport hotelId={activeHotel.hotel_id} range={range} />
      </div>
    </main>
  )
}
