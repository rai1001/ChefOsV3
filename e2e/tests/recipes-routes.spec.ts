import { test, expect } from '@playwright/test'

const skipIfNoSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

test.describe('recipes-routes', () => {
  test.skip(skipIfNoSupabase, 'Requires Supabase env vars')

  test('/recipes sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/recipes')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('/recipes/new sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/recipes/new')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('/recipes/<id>/escandallo sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/recipes/00000000-0000-0000-0000-000000000000/escandallo')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })
})
