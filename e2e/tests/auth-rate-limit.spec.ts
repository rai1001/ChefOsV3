import { test, expect } from '@playwright/test'

/**
 * Test de rate limiting (SEC-002, sprint-hardening).
 *
 * Solo se ejecuta cuando UPSTASH_REDIS_REST_URL/TOKEN están configuradas.
 * En modo skip (dev sin Upstash), `checkRateLimit` siempre permite, así que el spec
 * no aporta valor. CI gated.
 */

const skipIfNoUpstash = !process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN

test.describe('auth-rate-limit', () => {
  test.skip(skipIfNoUpstash, 'Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN')

  test('6 intentos seguidos de login devuelven 429', async ({ request }) => {
    // El preset 'login' permite 5/min. El 6º debe rebotar con 429.
    let lastStatus = 200
    for (let i = 0; i < 6; i++) {
      const response = await request.post('/login', {
        form: { email: `attacker-${Date.now()}@example.com`, password: 'wrong' },
        failOnStatusCode: false,
        maxRedirects: 0,
      })
      lastStatus = response.status()
      // Las primeras 5 deben pasar (devolverán 200/3xx con error de credenciales);
      // la 6ª debe ser 429.
      if (i === 5) {
        expect(lastStatus).toBe(429)
        const body = await response.json().catch(() => null)
        if (body) expect(body.error).toBe('rate_limited')
      }
    }
    expect(lastStatus).toBe(429)
  })
})
