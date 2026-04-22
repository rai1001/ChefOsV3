import { test, expect } from '@playwright/test'
import { loginAs } from '../fixtures/test-user'

const skipIfNoSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

test.describe('commercial-routes', () => {
  test.skip(skipIfNoSupabase, 'Requires Supabase env vars')

  test('/events sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/events')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('/events/new sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/events/new')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('/events/clients sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/events/clients')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('tras login, /events carga o redirige a /onboarding (depende de membership)', async ({
    page,
  }) => {
    await loginAs(page)
    await page.goto('/events')

    // Dos caminos válidos: con membership → /events (dashboard comercial),
    // sin membership → /onboarding (ADR-0009, sprint-02b: layout redirige aquí).
    await expect(page).toHaveURL(/\/(events|onboarding)/, { timeout: 10_000 })

    const currentUrl = page.url()
    if (currentUrl.includes('/onboarding')) {
      // Sin membership — verificamos que /onboarding renderiza el form.
      await expect(page.getByRole('heading', { name: /crea tu primer hotel/i })).toBeVisible()
    } else {
      // Con membership — verificamos header y botones de la página de eventos.
      await expect(page.getByRole('heading', { name: /eventos/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /nuevo evento/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /clientes/i })).toBeVisible()
    }
  })
})
