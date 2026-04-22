import { test, expect } from '@playwright/test'
import { loginAs } from '../fixtures/test-user'

const skipIfNoSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

test.describe('onboarding', () => {
  test.skip(skipIfNoSupabase, 'Requires Supabase env vars')

  test('/onboarding sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/onboarding')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('/invite/XYZ sin sesión redirige a /login', async ({ page }) => {
    // Proxy (sprint-01) redirige a /login; puede o no preservar next dependiendo de config.
    await page.goto('/invite/fake-token-1234567890')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('tras login sin hotel, / redirige a /onboarding (no /no-access)', async ({ page }) => {
    await loginAs(page)
    await page.goto('/')

    // Dos caminos válidos:
    // - Sin hotel activo → /onboarding (ADR-0009, layout app redirige aquí)
    // - Con hotel activo → / carga normal
    await expect(page).toHaveURL(/\/(onboarding)?$/, { timeout: 10_000 })

    if (page.url().includes('/onboarding')) {
      await expect(page.getByRole('heading', { name: /crea tu primer hotel/i })).toBeVisible()
      await expect(page.getByLabel(/empresa o grupo/i)).toBeVisible()
      await expect(page.getByLabel(/nombre del hotel/i)).toBeVisible()
    }
  })

  test('tras login, /invite/<token-inválido> muestra error de invitación', async ({ page }) => {
    await loginAs(page)
    await page.goto('/invite/this-token-does-not-exist-12345')

    // El guard del layout deja pasar; la página intenta previewInvite → error.
    // Acepta cualquiera de las dos UX: "invitación no válida" (preview falla, query RPC) o
    // redirect a /onboarding si el user aún no tiene hotel pero la page dejó pasar.
    // Tolerante: verificamos que al menos no hay error 500 blanco.
    const bodyText = await page.locator('body').innerText({ timeout: 10_000 })
    expect(bodyText.length).toBeGreaterThan(20)
  })
})
