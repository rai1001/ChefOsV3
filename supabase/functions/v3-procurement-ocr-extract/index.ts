import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.68.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  arrayBufferToBase64,
  getAnthropicDocumentBlockType,
  parseAnthropicOcrPayload,
  type AnthropicOcrPayload,
  type SupportedOcrMimeType,
} from './ocr-helpers.ts'

const FUNCTION_NAME = 'v3-procurement-ocr-extract'
const BUCKET_NAME = 'v3-procurement-uploads'
const OCR_MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 4096
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW_SECONDS = 3600

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SYSTEM_PROMPT = `You extract supplier invoice or delivery note data for a hotel procurement workflow.
Return only valid JSON with this exact shape:
{
  "header": {
    "supplier_name": string | null,
    "invoice_number": string | null,
    "invoice_date": "YYYY-MM-DD" | null,
    "total_amount": number | null,
    "currency": string | null
  },
  "lines": [
    {
      "description": string,
      "quantity": number,
      "unit": string | null,
      "unit_price": number,
      "line_total": number | null,
      "confidence": number | null
    }
  ]
}
Use decimal numbers. If a field is not visible, use null. Do not invent products or prices.`

type JsonRecord = Record<string, unknown>

interface OcrJobRow {
  id: string
  hotel_id: string
  storage_path: string
  mime_type: SupportedOcrMimeType
  sha256: string
  status: string
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  if (request.method !== 'POST') {
    return jsonResponse(405, {
      error_code: 'method_not_allowed',
      message: 'Method not allowed',
    })
  }

  let hotelId: string | null = null
  let jobId: string | null = null
  let serviceClient: ReturnType<typeof createClient> | null = null

  try {
    const env = readEnv()
    serviceClient = createClient(env.supabaseUrl, env.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const body = await readJsonBody(request)
    hotelId = readString(body.hotelId, 'hotelId')
    jobId = readString(body.jobId, 'jobId')

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse(401, {
        error_code: 'missing_authorization',
        message: 'Authorization bearer token required',
      })
    }

    const userClient = createClient(env.supabaseUrl, env.anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser()
    if (userError || !user) {
      return jsonResponse(401, {
        error_code: 'invalid_session',
        message: 'Invalid session',
      })
    }

    const { data: isMember, error: membershipError } = await userClient.rpc(
      'v3_is_member_of',
      { p_hotel_id: hotelId }
    )
    if (membershipError || isMember !== true) {
      return jsonResponse(403, {
        error_code: 'forbidden',
        message: 'No active membership for this hotel',
      })
    }

    const rateLimit = await enforceRateLimit(env, hotelId)
    if (!rateLimit.allowed) {
      await markJobFailed(serviceClient, hotelId, jobId, 'rate_limited', 'OCR rate limit exceeded')
      return jsonResponse(
        429,
        {
          error_code: 'rate_limited',
          message: 'OCR rate limit exceeded',
          retry_after_seconds: rateLimit.retryAfterSeconds,
        },
        { 'Retry-After': String(rateLimit.retryAfterSeconds) }
      )
    }

    const job = await fetchPendingJob(userClient, hotelId, jobId)
    if (job.status !== 'pending') {
      return jsonResponse(409, {
        error_code: 'invalid_job_state',
        message: `OCR job is ${job.status}`,
      })
    }

    const fileBuffer = await downloadDocument(serviceClient, job)
    const payload = await extractWithAnthropic(env.anthropicApiKey, job, fileBuffer)

    const { error: extractedError } = await serviceClient.rpc(
      'v3_set_ocr_job_extracted',
      {
        p_hotel_id: hotelId,
        p_job_id: jobId,
        p_payload: payload,
      }
    )
    if (extractedError) throw extractedError

    return jsonResponse(200, { jobId, status: 'extracted' })
  } catch (error) {
    console.error(
      JSON.stringify({
        function: FUNCTION_NAME,
        hotelId,
        jobId,
        error: error instanceof Error ? error.message : String(error),
      })
    )

    if (serviceClient && hotelId && jobId) {
      await markJobFailed(
        serviceClient,
        hotelId,
        jobId,
        normalizeErrorCode(error),
        error instanceof Error ? error.message : 'Unexpected OCR error'
      )
    }

    return jsonResponse(500, {
      error_code: normalizeErrorCode(error),
      message: 'OCR extraction failed',
    })
  }
})

function readEnv() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !anthropicApiKey) {
    throw new Error('OCR_ENV_MISSING')
  }

  return {
    supabaseUrl,
    anonKey,
    serviceRoleKey,
    anthropicApiKey,
    upstashUrl: Deno.env.get('UPSTASH_REDIS_REST_URL'),
    upstashToken: Deno.env.get('UPSTASH_REDIS_REST_TOKEN'),
  }
}

async function readJsonBody(request: Request): Promise<JsonRecord> {
  const body = (await request.json()) as unknown
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('INVALID_REQUEST_BODY')
  }
  return body as JsonRecord
}

function readString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`INVALID_${field.toUpperCase()}`)
  }
  return value.trim()
}

async function enforceRateLimit(
  env: ReturnType<typeof readEnv>,
  hotelId: string
): Promise<{ allowed: true } | { allowed: false; retryAfterSeconds: number }> {
  if (!env.upstashUrl || !env.upstashToken) {
    console.warn(
      JSON.stringify({
        function: FUNCTION_NAME,
        warning: 'UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN missing; rate limit skipped',
      })
    )
    return { allowed: true }
  }

  const hourBucket = Math.floor(Date.now() / (RATE_LIMIT_WINDOW_SECONDS * 1000))
  const key = `ocr:hotel:${hotelId}:${hourBucket}`
  const encodedKey = encodeURIComponent(key)
  const headers = { Authorization: `Bearer ${env.upstashToken}` }

  const incrResponse = await fetch(`${env.upstashUrl}/incr/${encodedKey}`, {
    method: 'POST',
    headers,
  })
  if (!incrResponse.ok) throw new Error('RATE_LIMIT_UNAVAILABLE')

  const incrBody = (await incrResponse.json()) as { result?: number }
  const count = Number(incrBody.result ?? 0)
  if (count === 1) {
    await fetch(`${env.upstashUrl}/expire/${encodedKey}/${RATE_LIMIT_WINDOW_SECONDS}`, {
      method: 'POST',
      headers,
    })
  }

  if (count > RATE_LIMIT_MAX) {
    return { allowed: false, retryAfterSeconds: RATE_LIMIT_WINDOW_SECONDS }
  }

  return { allowed: true }
}

async function fetchPendingJob(
  supabase: ReturnType<typeof createClient>,
  hotelId: string,
  jobId: string
): Promise<OcrJobRow> {
  const { data, error } = await supabase
    .from('v3_procurement_ocr_jobs')
    .select('id, hotel_id, storage_path, mime_type, sha256, status')
    .eq('hotel_id', hotelId)
    .eq('id', jobId)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('OCR_JOB_NOT_FOUND')

  return data as OcrJobRow
}

async function downloadDocument(
  supabase: ReturnType<typeof createClient>,
  job: OcrJobRow
): Promise<ArrayBuffer> {
  const expectedPrefix = `${job.hotel_id}/${job.sha256}.`
  if (!job.storage_path.startsWith(expectedPrefix)) {
    throw new Error('OCR_STORAGE_PATH_MISMATCH')
  }

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(job.storage_path)
  if (error) throw error
  if (!data) throw new Error('OCR_DOCUMENT_NOT_FOUND')

  return await data.arrayBuffer()
}

async function extractWithAnthropic(
  apiKey: string,
  job: OcrJobRow,
  fileBuffer: ArrayBuffer
): Promise<AnthropicOcrPayload> {
  const anthropic = new Anthropic({ apiKey })
  const base64 = arrayBufferToBase64(fileBuffer)
  const blockType = getAnthropicDocumentBlockType(job.mime_type)
  const mediaBlock =
    blockType === 'document'
      ? {
          type: 'document',
          source: {
            type: 'base64',
            media_type: job.mime_type,
            data: base64,
          },
        }
      : {
          type: 'image',
          source: {
            type: 'base64',
            media_type: job.mime_type,
            data: base64,
          },
        }

  const response = await anthropic.messages.create({
    model: OCR_MODEL,
    max_tokens: MAX_TOKENS,
    temperature: 0,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: [
          mediaBlock,
          {
            type: 'text',
            text: 'Extract the invoice data now. Return JSON only.',
          },
        ],
      },
    ],
  })

  const text = response.content
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n')

  return parseAnthropicOcrPayload(text)
}

async function markJobFailed(
  supabase: ReturnType<typeof createClient>,
  hotelId: string,
  jobId: string,
  errorCode: string,
  errorMessage: string
) {
  const { error } = await supabase.rpc('v3_set_ocr_job_failed', {
    p_hotel_id: hotelId,
    p_job_id: jobId,
    p_error_code: errorCode,
    p_error_message: errorMessage.slice(0, 1000),
  })

  if (error) {
    console.error(
      JSON.stringify({
        function: FUNCTION_NAME,
        hotelId,
        jobId,
        error: error.message,
        action: 'mark_job_failed_failed',
      })
    )
  }
}

function normalizeErrorCode(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message.split(':')[0]?.toLowerCase().slice(0, 120) ?? 'ocr_failed'
  }
  return 'ocr_failed'
}

function jsonResponse(
  status: number,
  body: JsonRecord,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      ...headers,
      'Content-Type': 'application/json',
    },
  })
}
