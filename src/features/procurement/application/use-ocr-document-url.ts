'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { createOcrDocumentSignedUrl } from '../infrastructure/storage'

export function useOcrDocumentUrl(storagePath: string | undefined) {
  return useQuery<string>({
    queryKey: ['procurement', 'ocr-document-url', storagePath],
    enabled: !!storagePath,
    staleTime: 4 * 60 * 1000,
    queryFn: async () => {
      const supabase = createClient()
      return createOcrDocumentSignedUrl(supabase, storagePath!)
    },
  })
}
