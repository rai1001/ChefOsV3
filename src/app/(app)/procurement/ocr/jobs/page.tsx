import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { OcrJobsList } from '@/features/procurement/components/ocr-jobs-list'

export const dynamic = 'force-dynamic'

export default async function ProcurementOcrJobsPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/procurement" className="hover:underline">
              Compras
            </Link>
          </p>
          <h1>Cola OCR · {activeHotel.hotel_name}</h1>
        </header>

        <OcrJobsList hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}
