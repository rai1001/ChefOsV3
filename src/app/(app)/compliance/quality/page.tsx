import {
  rangeFromSearchParams,
  urlSearchParamsFromRecord,
} from '@/features/compliance'
import {
  QualityCheckForm,
  QualityChecksList,
} from '@/features/compliance/components/quality-check-form'
import { getActiveHotelOrNull } from '@/features/identity/server'

export const dynamic = 'force-dynamic'

export default async function ComplianceQualityPage({
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
        <header>
          <p className="kpi-label">APPCC</p>
          <h1>Recepción · {activeHotel.hotel_name}</h1>
        </header>
        <QualityCheckForm hotelId={activeHotel.hotel_id} />
        <QualityChecksList hotelId={activeHotel.hotel_id} range={range} />
      </div>
    </main>
  )
}

