import type { NextConfig } from 'next'

// Headers de seguridad — sprint-hardening (SEC-004 Codex, ADR-0011).
// Aplicados a todas las rutas. CSP intencionalmente permisiva en dev (HMR + eval de Turbopack)
// y estricta en producción.
//
// connect-src incluye Supabase y Upstash:
//   - https://*.supabase.co (URL del proyecto + edge functions + auth)
//   - https://*.upstash.io (rate limit REST API)
//   - wss://*.supabase.co (realtime channels, si se usaran)
const isProd = process.env.NODE_ENV === 'production'

const cspDirectives: string[] = [
  "default-src 'self'",
  // 'unsafe-eval' necesario para Turbopack en dev. En prod se elimina.
  isProd
    ? "script-src 'self'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.upstash.io",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
]

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: cspDirectives.join('; '),
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
