import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import {
  buildOcrStoragePath,
  OCR_MIME_TYPES,
  type OcrMimeType,
} from '../domain/ocr'

export const OCR_UPLOAD_BUCKET = 'v3-procurement-uploads'
export const OCR_MAX_UPLOAD_BYTES = 8 * 1024 * 1024

export interface UploadOcrDocumentInput {
  hotelId: string
  file: File
  sha256: string
}

export interface UploadOcrDocumentResult {
  storage_path: string
  mime_type: OcrMimeType
  sha256: string
}

type StorageUploadResult = Promise<{ data: unknown; error: unknown }>
type StorageSignedUrlResult = Promise<{
  data: { signedUrl: string } | null
  error: unknown
}>

type StorageBucket = {
  upload: (
    path: string,
    file: File,
    options: { contentType: string; upsert: boolean }
  ) => StorageUploadResult
  createSignedUrl: (path: string, expiresIn: number) => StorageSignedUrlResult
}

type StorageClient = SupabaseClient & {
  storage: { from: (bucket: string) => StorageBucket }
}

export function validateOcrDocumentFile(file: File): OcrMimeType {
  const mimeType = file.type as OcrMimeType
  if (!OCR_MIME_TYPES.includes(mimeType)) {
    throw new Error('OCR_FILE_MIME_UNSUPPORTED')
  }
  if (file.size > OCR_MAX_UPLOAD_BYTES) {
    throw new Error('OCR_FILE_TOO_LARGE')
  }
  return mimeType
}

export async function calculateFileSha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  return [...new Uint8Array(hashBuffer)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function uploadOcrDocument(
  supabase: SupabaseClient,
  input: UploadOcrDocumentInput
): Promise<UploadOcrDocumentResult> {
  const mimeType = validateOcrDocumentFile(input.file)
  const storagePath = buildOcrStoragePath({
    hotelId: input.hotelId,
    sha256: input.sha256,
    mimeType,
  })
  const storage = (supabase as StorageClient).storage.from(OCR_UPLOAD_BUCKET)
  const { error } = await storage.upload(storagePath, input.file, {
    contentType: mimeType,
    upsert: true,
  })

  if (error) throw mapSupabaseError(error, { resource: 'ocr_document' })

  return {
    storage_path: storagePath,
    mime_type: mimeType,
    sha256: input.sha256,
  }
}

export async function createOcrDocumentSignedUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresInSeconds = 300
): Promise<string> {
  const storage = (supabase as StorageClient).storage.from(OCR_UPLOAD_BUCKET)
  const { data, error } = await storage.createSignedUrl(
    storagePath,
    expiresInSeconds
  )

  if (error) throw mapSupabaseError(error, { resource: 'ocr_document' })
  if (!data?.signedUrl) throw new Error('OCR_SIGNED_URL_MISSING')

  return data.signedUrl
}
