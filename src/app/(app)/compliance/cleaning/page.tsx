import { CleaningLogChecklist } from '@/features/compliance/components/cleaning-log-checklist'
import { getActiveHotelOrNull } from '@/features/identity/server'

export const dynamic = 'force-dynamic'

export default async function ComplianceCleaningPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="kpi-label">APPCC</p>
          <h1>Limpieza · {activeHotel.hotel_name}</h1>
        </header>
        <CleaningLogChecklist hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}

