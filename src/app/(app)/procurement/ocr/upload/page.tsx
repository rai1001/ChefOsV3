import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { OcrUploadForm } from '@/features/procurement/components/ocr-upload-form'

export const dynamic = 'force-dynamic'

export default async function ProcurementOcrUploadPage() {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/procurement" className="hover:underline">
              Compras
            </Link>
          </p>
          <h1>OCR compras · {activeHotel.hotel_name}</h1>
        </header>

        <OcrUploadForm hotelId={activeHotel.hotel_id} />
      </div>
    </main>
  )
}
