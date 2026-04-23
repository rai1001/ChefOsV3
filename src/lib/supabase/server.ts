import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import type { CookieOptions } from '@supabase/ssr'

export class SupabaseEnvMissingError extends Error {
  readonly code = 'SUPABASE_ENV_MISSING' as const
  constructor() {
    super('Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)')
    this.name = 'SupabaseEnvMissingError'
  }
}

function createServerCookieAdapter(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return {
    getAll() {
      return cookieStore.getAll()
    },
    setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
      try {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        )
      } catch {
        // setAll llamado desde Server Component: ignorable si el middleware refresca sesión.
      }
    },
  }
}

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Supabase env vars missing in production: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required'
      )
    }
    // Dev/test: señalizamos con error tipado que los helpers *OrNull pueden capturar.
    throw new SupabaseEnvMissingError()
  }

  const cookieStore = await cookies()

  return createServerClient(url, anonKey, {
    cookies: createServerCookieAdapter(cookieStore),
  })
}
