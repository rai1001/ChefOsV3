import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { getCurrentUserOrNull, getActiveHotelOrNull } from '@/features/identity/server'

// Depende de sesión → no prerenderizable.
export const dynamic = 'force-dynamic'

/**
 * Layout (onboard) — protege rutas que requieren usuario autenticado pero NO hotel activo.
 * Si el user YA tiene hotel activo, redirige al dashboard (/).
 */
export default async function OnboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUserOrNull()
  if (!user) redirect('/login')

  const activeHotel = await getActiveHotelOrNull()
  if (activeHotel) redirect('/')

  return <>{children}</>
}
