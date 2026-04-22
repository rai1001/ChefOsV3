'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { useEventBeo } from '../application/use-event-beo'
import { BeoDocument } from './beo-document'

/**
 * Componente cliente que renderiza el link de descarga del BEO PDF.
 * Solo importado a través de `dynamic()` desde `beo-download-button.tsx`.
 */
export default function BeoDownloadLink({
  hotelId,
  eventId,
}: {
  hotelId: string
  eventId: string
}) {
  const { data, isLoading, error } = useEventBeo(hotelId, eventId)

  if (isLoading) {
    return (
      <Button variant="secondary" size="sm" disabled>
        Cargando datos BEO…
      </Button>
    )
  }
  if (error || !data) {
    return (
      <Button variant="secondary" size="sm" disabled>
        BEO no disponible
      </Button>
    )
  }

  const fileName = `BEO-${data.beo_number ?? data.id}.pdf`

  return (
    <PDFDownloadLink document={<BeoDocument data={data} />} fileName={fileName}>
      {({ loading }) => (
        <Button variant="primary" size="sm" disabled={loading}>
          {loading ? 'Generando PDF…' : 'Descargar BEO'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
