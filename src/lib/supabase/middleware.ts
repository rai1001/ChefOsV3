import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const AUTH_FREE_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password', '/callback']

function resolveEnvOrFail(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (url && anonKey) return { url, anonKey }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Supabase env vars missing in production: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required'
    )
  }

  // Dev/test: warn una sola vez por proceso.
  if (!globalThis.__chefos_supabase_env_warned) {
    console.warn(
      '[chefos] Supabase env vars missing — proxy running in pass-through mode (dev/test only).'
    )
    globalThis.__chefos_supabase_env_warned = true
  }
  return null
}

declare global {
  var __chefos_supabase_env_warned: boolean | undefined
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const env = resolveEnvOrFail()
  if (!env) return supabaseResponse

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthFreePath = AUTH_FREE_PATHS.some((path) => pathname.startsWith(path))

  if (!user && !isAuthFreePath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthFreePath && pathname !== '/callback' && pathname !== '/reset-password') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
