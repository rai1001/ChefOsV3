import { test, expect } from '@playwright/test'

const skipIfNoSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

test.describe('menus-routes', () => {
  test.skip(skipIfNoSupabase, 'Requires Supabase env vars')

  test('/menus sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/menus')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('/menus/new sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/menus/new')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('/menus/<id> sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/menus/00000000-0000-0000-0000-000000000000')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })
})
