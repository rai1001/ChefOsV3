import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { fetchImportRun } from '../infrastructure/import-queries'
import type { ImportRun } from '../domain/types'

export async function getImportRunServer(hotelId: string, runId: string): Promise<ImportRun> {
  const supabase = await createClient()
  return fetchImportRun(supabase, hotelId, runId)
}
