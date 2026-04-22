import { test, expect } from '@playwright/test'

const skipIfNoSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

test.describe('auth-forgot-reset', () => {
  test.skip(skipIfNoSupabase, 'Requires Supabase env vars')

  test('forgot-password acepta email válido y muestra confirmación', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.getByLabel(/email/i).fill('any@example.com')
    await page.getByRole('button', { name: /enviar enlace/i }).click()

    await expect(page.getByRole('heading', { name: /revisa tu email/i })).toBeVisible({
      timeout: 10_000,
    })
  })

  test('forgot-password rechaza email inválido', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.getByLabel(/email/i).fill('no-es-email')
    await page.getByRole('button', { name: /enviar enlace/i }).click()

    // HTML5 validation o Zod — en ambos casos no avanza al success
    await expect(page).toHaveURL(/\/forgot-password/)
  })

  test('reset-password muestra formulario (sin code funciona solo si hay sesión activa)', async ({
    page,
  }) => {
    await page.goto('/reset-password')
    await expect(page.getByRole('heading', { name: /nueva contraseña/i })).toBeVisible()
  })
})
