import { getActiveHotelOrNull } from '@/features/identity/server'
import { ComplianceDashboard } from '@/features/compliance/components/compliance-dashboard'

export const dynamic = 'force-dynamic'

export default async function CompliancePage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="kpi-label">Sprint-10 · Compliance APPCC</p>
          <h1>APPCC · {activeHotel.hotel_name}</h1>
        </header>
        <ComplianceDashboard hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}

