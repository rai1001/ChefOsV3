import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import type { Database } from '@/types/database'
import type {
  ApplyOcrJobInput,
  ApplyOcrJobResult,
  CreateOcrJobInput,
  RejectOcrJobInput,
  ReviewOcrJobInput,
  TriggerOcrExtractInput,
  TriggerOcrExtractResult,
} from '../domain/ocr'

type Client = SupabaseClient<Database>

export async function createOcrJob(
  supabase: Client,
  input: CreateOcrJobInput
): Promise<string> {
  const { data, error } = await supabase.rpc('v3_create_ocr_job', {
    p_hotel_id: input.hotel_id,
    p_storage_path: input.storage_path,
    p_mime_type: input.mime_type,
    p_sha256: input.sha256,
    ...(input.supplier_id ? { p_supplier_id: input.supplier_id } : {}),
    ...(input.purchase_order_id ? { p_purchase_order_id: input.purchase_order_id } : {}),
  })

  if (error) throw mapSupabaseError(error, { resource: 'ocr_job' })
  return String(data)
}

export async function triggerOcrExtract(
  supabase: Client,
  input: TriggerOcrExtractInput
): Promise<TriggerOcrExtractResult> {
  const { data, error } = await supabase.functions.invoke<TriggerOcrExtractResult>(
    'v3-procurement-ocr-extract',
    {
      body: {
        hotelId: input.hotel_id,
        jobId: input.job_id,
      },
    }
  )

  if (error) throw mapSupabaseError(error, { resource: 'ocr_job' })
  if (!data) throw new Error('OCR extract returned empty payload')
  return data
}

export async function reviewOcrJob(
  supabase: Client,
  input: ReviewOcrJobInput
): Promise<void> {
  const { error } = await supabase.rpc('v3_review_ocr_job', {
    p_hotel_id: input.hotel_id,
    p_job_id: input.job_id,
    p_reviewed_payload: input.reviewed_payload,
  })

  if (error) throw mapSupabaseError(error, { resource: 'ocr_job' })
}

export async function applyOcrJob(
  supabase: Client,
  input: ApplyOcrJobInput
): Promise<ApplyOcrJobResult> {
  const { data, error } = await supabase.rpc('v3_apply_ocr_job', {
    p_hotel_id: input.hotel_id,
    p_job_id: input.job_id,
  })

  if (error) throw mapSupabaseError(error, { resource: 'ocr_job' })
  return data as unknown as ApplyOcrJobResult
}

export async function rejectOcrJob(
  supabase: Client,
  input: RejectOcrJobInput
): Promise<void> {
  const { error } = await supabase.rpc('v3_reject_ocr_job', {
    p_hotel_id: input.hotel_id,
    p_job_id: input.job_id,
    p_reason: input.reason,
  })

  if (error) throw mapSupabaseError(error, { resource: 'ocr_job' })
}
