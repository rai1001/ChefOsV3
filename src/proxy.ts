import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { checkRateLimit, identifierFromRequest, type RateLimitPreset } from '@/lib/rate-limit'

const RATE_LIMITED_PATHS: Array<{
  pathPrefix: string
  methods: string[]
  preset: RateLimitPreset
}> = [
  { pathPrefix: '/login', methods: ['POST'], preset: 'login' },
  { pathPrefix: '/signup', methods: ['POST'], preset: 'signup' },
  { pathPrefix: '/forgot-password', methods: ['POST'], preset: 'forgot-password' },
  { pathPrefix: '/invite/', methods: ['POST'], preset: 'invite-accept' },
]

function matchRateLimit(request: NextRequest): RateLimitPreset | null {
  const pathname = request.nextUrl.pathname
  const method = request.method
  for (const rule of RATE_LIMITED_PATHS) {
    if (pathname.startsWith(rule.pathPrefix) && rule.methods.includes(method)) {
      return rule.preset
    }
  }
  return null
}

async function maybeHandleRateLimit(
  request: NextRequest,
  preset: RateLimitPreset
): Promise<NextResponse | null> {
  const id = identifierFromRequest(request)
  const limit = await checkRateLimit(preset, id)
  if (!limit.ok) {
    return new NextResponse(
      JSON.stringify({
        error: 'rate_limited',
        message: 'Demasiadas peticiones, espera un momento.',
        retryAfterSeconds: limit.retryAfterSeconds,
      }),
      {
        status: 429,
        headers: {
          'content-type': 'application/json',
          'retry-after': String(limit.retryAfterSeconds || 60),
        },
      }
    )
  }
  return null
}

export async function proxy(request: NextRequest) {
  const preset = matchRateLimit(request)
  const rateLimitResponse = preset ? await maybeHandleRateLimit(request, preset) : null

  if (rateLimitResponse) return rateLimitResponse

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, *.png, *.svg (assets)
     * - api routes (manejan su propia auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
