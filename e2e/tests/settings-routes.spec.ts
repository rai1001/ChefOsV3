import { test, expect } from '@playwright/test'

const skipIfNoSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

test.describe('settings-routes', () => {
  test.skip(skipIfNoSupabase, 'Requires Supabase env vars')

  test('/settings sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('/settings/hotels sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/settings/hotels')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })

  test('/settings/team sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/settings/team')
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })
})
