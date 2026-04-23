import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // Validate next to be a safe internal relative path.
  // Reject external URLs, absolute URLs, or protocol-relative URLs starting with //
  const isSafeNext = next.startsWith('/') && !next.startsWith('//')
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
