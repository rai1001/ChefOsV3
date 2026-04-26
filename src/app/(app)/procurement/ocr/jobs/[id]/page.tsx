import Link from 'next/link'
import { getActiveHotelOrNull } from '@/features/identity/server'
import { OcrJobReview } from '@/features/procurement/components/ocr-job-review'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProcurementOcrJobDetailPage({ params }: PageProps) {
  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return null

  const { id } = await params

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p className="kpi-label">
            <Link href="/procurement/ocr/jobs" className="hover:underline">
              Cola OCR
            </Link>
          </p>
          <h1>Revision OCR · {activeHotel.hotel_name}</h1>
        </header>

        <OcrJobReview hotelId={activeHotel.hotel_id} jobId={id} />
      </div>
    </main>
  )
}
