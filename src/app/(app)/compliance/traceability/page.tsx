import { LotTraceabilityTree } from '@/features/compliance/components/lot-traceability-tree'
import { getActiveHotelOrNull } from '@/features/identity/server'

export const dynamic = 'force-dynamic'

export default async function ComplianceTraceabilityPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="kpi-label">APPCC</p>
          <h1>Trazabilidad · {activeHotel.hotel_name}</h1>
        </header>
        <LotTraceabilityTree hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}

