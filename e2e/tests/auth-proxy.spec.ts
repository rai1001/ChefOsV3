import { test, expect } from '@playwright/test'

/**
 * El proxy (middleware) debe redirigir rutas protegidas a /login cuando no hay sesión.
 *
 * Este spec funciona con y sin env vars de Supabase configuradas:
 * - Sin env vars: proxy en modo pass-through (dev/test) → `/` renderiza el dashboard
 *   pero falla el `getCurrentUserOrNull()` del layout → redirect a /login igualmente.
 * - Con env vars: proxy endurecido redirige en la capa middleware.
 */
test.describe('auth-proxy', () => {
  test('visitar / sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('visitar /login sin sesión renderiza la página', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /entrar/i })).toBeVisible()
  })
})
