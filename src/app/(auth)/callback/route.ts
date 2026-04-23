import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // Validate `next` as an internal app path only.
  // Reject protocol-relative values (`//foo`), backslash-prefixed variants (`/\foo`)
  // and any payload containing backslashes to avoid WHATWG URL slash-normalization
  // turning the redirect into an external origin.
  const isSafeNext = next.startsWith('/') && !next.startsWith('//') && !next.includes('\\')
  const safeNext = isSafeNext ? next : '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, request.url))
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_callback_error', request.url))
}
