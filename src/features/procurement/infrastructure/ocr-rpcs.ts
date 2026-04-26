import type { SupabaseClient } from '@supabase/supabase-js'
import { mapSupabaseError } from '@/lib/errors/map-supabase-error'
import type {
  ApplyOcrJobInput,
  ApplyOcrJobResult,
  CreateOcrJobInput,
  RejectOcrJobInput,
  ReviewOcrJobInput,
  TriggerOcrExtractInput,
  TriggerOcrExtractResult,
} from '../domain/ocr'

type RpcCaller = (
  fn: string,
  args: Record<string, unknown>
) => Promise<{ data: unknown; error: unknown }>

type FunctionInvoker = {
  functions: {
    invoke: (
      fn: string,
      options: { body: Record<string, unknown> }
    ) => Promise<{ data: unknown; error: unknown }>
  }
}

export async function createOcrJob(
  supabase: SupabaseClient,
  input: CreateOcrJobInput
): Promise<string> {
  const rpc = supabase.rpc as unknown as RpcCaller
  const { data, error } = await rpc('v3_create_ocr_job', {
    p_hotel_id: input.hotel_id,
    p_storage_path: input.storage_path,
    p_mime_type: input.mime_type,
    p_sha256: input.sha256,
    p_supplier_id: input.supplier_id ?? null,
    p_purchase_order_id: input.purchase_order_id ?? null,
  })

  if (error) throw mapSupabaseError(error, { resource: 'ocr_job' })
  return String(data)
}

export async function triggerOcrExtract(
  supabase: SupabaseClient,
  input: TriggerOcrExtractInput
): Promise<TriggerOcrExtractResult> {
  const client = supabase as unknown as FunctionInvoker
  const { data, error } = await client.functions.invoke('v3-procurement-ocr-extract', {
    body: {
      hotelId: input.hotel_id,
      jobId: input.job_id,
    },
  })

  if (error) throw mapSupabaseError(error, { resource: 'ocr_job' })
  return data as TriggerOcrExtractResult
}

export async function reviewOcrJob(
  supabase: SupabaseClient,
  input: ReviewOcrJobInput
): Promise<void> {
  const rpc = supabase.rpc as unknown as RpcCaller
  const { error } = await rpc('v3_review_ocr_job', {
    p_hotel_id: input.hotel_id,
    p_job_id: input.job_id,
    p_reviewed_payload: input.reviewed_payload,
  })

  if (error) throw mapSupabaseError(error, { resource: 'ocr_job' })
}

export async function applyOcrJob(
  supabase: SupabaseClient,
  input: ApplyOcrJobInput
): Promise<ApplyOcrJobResult> {
  const rpc = supabase.rpc as unknown as RpcCaller
  const { data, error } = await rpc('v3_apply_ocr_job', {
    p_hotel_id: input.hotel_id,
    p_job_id: input.job_id,
  })

  if (error) throw mapSupabaseError(error, { resource: 'ocr_job' })
  return data as ApplyOcrJobResult
}

export async function rejectOcrJob(
  supabase: SupabaseClient,
  input: RejectOcrJobInput
): Promise<void> {
  const rpc = supabase.rpc as unknown as RpcCaller
  const { error } = await rpc('v3_reject_ocr_job', {
    p_hotel_id: input.hotel_id,
    p_job_id: input.job_id,
    p_reason: input.reason,
  })

  if (error) throw mapSupabaseError(error, { resource: 'ocr_job' })
}
