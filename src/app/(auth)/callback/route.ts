import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildAbsoluteUrl } from '@/lib/app-url'

function getSafeNextPath(nextParam: string | null): string {
  if (
    !nextParam ||
    !nextParam.startsWith('/') ||
    nextParam.startsWith('//') ||
    nextParam.startsWith('/\\') ||
    nextParam.includes('://') ||
    nextParam.toLowerCase().startsWith('javascript:') ||
    nextParam.toLowerCase().startsWith('data:') ||
    nextParam.toLowerCase().startsWith('vbscript:')
  ) {
    return '/'
  }

  return nextParam
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const nextPath = getSafeNextPath(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(buildAbsoluteUrl(nextPath))
    }
  }

  return NextResponse.redirect(buildAbsoluteUrl('/login?error=auth_callback_error'))
}
