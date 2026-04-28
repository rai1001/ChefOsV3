import { CleaningAreaManager } from '@/features/compliance/components/cleaning-area-manager'
import { getActiveHotelOrNull } from '@/features/identity/server'

export const dynamic = 'force-dynamic'

export default async function ComplianceAreasPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="kpi-label">APPCC</p>
          <h1>Áreas de limpieza · {activeHotel.hotel_name}</h1>
        </header>
        <CleaningAreaManager hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}
