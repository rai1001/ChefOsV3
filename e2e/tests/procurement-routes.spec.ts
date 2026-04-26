import { test, expect } from '@playwright/test'
import { loginAs } from '../fixtures/test-user'

const skipIfNoSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

test.describe('procurement-routes', () => {
  test.skip(skipIfNoSupabase, 'Requires Supabase env vars')

  test('/procurement sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/procurement')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('/procurement/purchase-requests sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/procurement/purchase-requests')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('/procurement/purchase-orders sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/procurement/purchase-orders')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('tras login, /procurement carga o redirige a /onboarding', async ({ page }) => {
    await loginAs(page)
    await page.goto('/procurement')

    await expect(page).toHaveURL(/\/(procurement|onboarding)/, { timeout: 10_000 })

    const currentUrl = page.url()
    if (currentUrl.includes('/onboarding')) {
      await expect(page.getByRole('heading', { name: /crea tu primer hotel/i })).toBeVisible()
    } else {
      await expect(page.getByRole('heading', { name: /compras/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /solicitudes/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /pedidos/i })).toBeVisible()
    }
  })
})
