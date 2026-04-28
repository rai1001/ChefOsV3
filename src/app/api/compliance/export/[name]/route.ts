import type { SupabaseClient } from '@supabase/supabase-js'
import { getActiveHotelOrNull } from '@/features/identity/server'
import type { Role } from '@/features/identity'
import {
  rangeFromSearchParams,
} from '@/features/compliance'
import {
  buildComplianceExportCsv,
  isComplianceExportName,
  type ComplianceExportName,
} from '@/features/compliance/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COMPLIANCE_EXPORT_ROLES: readonly Role[] = ['head_chef', 'admin', 'direction']

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params
  if (!isComplianceExportName(name)) {
    return new Response('Unknown compliance export', { status: 404 })
  }

  const activeHotel = await getActiveHotelOrNull()
  if (!activeHotel) return new Response('Unauthorized', { status: 401 })
  if (!COMPLIANCE_EXPORT_ROLES.includes(activeHotel.role)) {
    return new Response('Forbidden', { status: 403 })
  }

  const searchParams = new URL(request.url).searchParams
  const range = rangeFromSearchParams(searchParams)
  const supabase = await createClient()
  const csv = await buildCsv({
    name,
    supabase,
    hotelId: activeHotel.hotel_id,
    range,
  })

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="chefos-appcc-${name}-${range.from}-${range.to}.csv"`,
      'Cache-Control': 'private, max-age=0, must-revalidate',
    },
  })
}

async function buildCsv({
  name,
  supabase,
  hotelId,
  range,
}: {
  name: ComplianceExportName
  supabase: SupabaseClient
  hotelId: string
  range: { from: string; to: string }
}): Promise<string> {
  return buildComplianceExportCsv({ name, supabase, hotelId, range })
}
