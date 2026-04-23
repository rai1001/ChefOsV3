import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getSafeNextPath(nextParam: string | null): string {
  if (!nextParam || !nextParam.startsWith('/') || nextParam.startsWith('//')) {
    return '/'
  }

  return nextParam
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const nextPath = getSafeNextPath(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${nextPath}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
