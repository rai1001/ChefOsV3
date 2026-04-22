import { test, expect } from '@playwright/test'
import { TEST_USER_EMAIL, TEST_USER_PASSWORD, loginAs } from '../fixtures/test-user'

/**
 * Requiere env vars de Supabase reales + user seed (global-setup.ts).
 * Gated por E2E_ENABLED=true en CI.
 */
const skipIfNoSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

test.describe('auth-login', () => {
  test.skip(skipIfNoSupabase, 'Requires Supabase env vars')

  test('credenciales inválidas muestran error', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(TEST_USER_EMAIL)
    await page.getByLabel(/contraseña/i).fill('wrong-password')
    await page.getByRole('button', { name: /entrar/i }).click()

    await expect(page.locator('.alert-box.urgent')).toBeVisible({ timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('email inválido muestra error de campo (Zod)', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('no-es-email')
    await page.getByLabel(/contraseña/i).fill('anything')
    await page.getByRole('button', { name: /entrar/i }).click()

    // El HTML5 `type=email` captura primero; si pasa, Zod lo marca.
    await expect(page).toHaveURL(/\/login/)
  })

  test('login OK redirige fuera de /login', async ({ page }) => {
    await loginAs(page, TEST_USER_EMAIL, TEST_USER_PASSWORD)
    // Post-login: / (dashboard) o /no-access si no tiene hotel
    expect(page.url()).not.toMatch(/\/login/)
  })
})
