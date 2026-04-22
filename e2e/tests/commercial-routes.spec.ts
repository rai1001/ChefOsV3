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

  test('tras login, /events carga o redirige a /no-access (depende de membership)', async ({
    page,
  }) => {
    await loginAs(page)
    await page.goto('/events')

    // Dos caminos válidos: con membership → /events (dashboard comercial),
    // sin membership → /no-access (ADR-0007: onboarding diferido a sprint-02b).
    await expect(page).toHaveURL(/\/(events|no-access)/, { timeout: 10_000 })

    const currentUrl = page.url()
    if (currentUrl.includes('/no-access')) {
      // Sin membership — verificamos que /no-access renderiza.
      await expect(page.getByRole('heading')).toBeVisible()
    } else {
      // Con membership — verificamos header y botones de la página de eventos.
      await expect(page.getByRole('heading', { name: /eventos/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /nuevo evento/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /clientes/i })).toBeVisible()
    }
  })
})
