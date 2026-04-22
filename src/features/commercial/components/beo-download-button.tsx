'use client'

import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'

/**
 * Lazy wrapper para evitar que `@react-pdf/renderer` entre al bundle server-side.
 * El botón real vive en `./beo-download-link.tsx` y se carga solo en cliente.
 * Patrón validado en v2 (ADR-0005-extensión-1) — evita crash Turbopack.
 */
const LazyLink = dynamic(() => import('./beo-download-link'), {
  ssr: false,
  loading: () => (
    <Button variant="secondary" size="sm" disabled>
      Cargando PDF…
    </Button>
  ),
})

export function BeoDownloadButton({ hotelId, eventId }: { hotelId: string; eventId: string }) {
  return <LazyLink hotelId={hotelId} eventId={eventId} />
}
