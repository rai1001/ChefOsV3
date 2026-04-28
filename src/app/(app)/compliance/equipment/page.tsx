import { EquipmentManager } from '@/features/compliance/components/equipment-manager'
import { getActiveHotelOrNull } from '@/features/identity/server'

export const dynamic = 'force-dynamic'

export default async function ComplianceEquipmentPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="kpi-label">APPCC</p>
          <h1>Equipos · {activeHotel.hotel_name}</h1>
        </header>
        <EquipmentManager hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}

