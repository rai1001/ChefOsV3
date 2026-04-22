import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { getCurrentUserOrNull, getActiveHotelOrNull } from '@/features/identity/server'

// Dashboard depende de sesión → no prerenderizable.
export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUserOrNull()
  if (!user) redirect('/login')

  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) redirect('/no-access')

  return <>{children}</>
}
