import { getActiveHotelOrNull } from '@/features/identity/server'
import { ReportHeader } from '@/features/reporting/components/report-ui'
import { StockHealthReport } from '@/features/reporting/components/stock-health-report'

export const dynamic = 'force-dynamic'

export default async function StockHealthReportPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <ReportHeader title="Stock health" hotelName={activeHotel.hotel_name} />
        <StockHealthReport hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}
