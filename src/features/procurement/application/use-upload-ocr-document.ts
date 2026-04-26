'use client'

import { useMutation } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  calculateFileSha256,
  uploadOcrDocument,
  type UploadOcrDocumentResult,
} from '../infrastructure/storage'

export function useUploadOcrDocument() {
  return useMutation({
    mutationFn: async (input: {
      hotelId: string
      file: File
    }): Promise<UploadOcrDocumentResult> => {
      const supabase = createClient()
      const sha256 = await calculateFileSha256(input.file)
      return uploadOcrDocument(supabase, {
        hotelId: input.hotelId,
        file: input.file,
        sha256,
      })
    },
  })
}
