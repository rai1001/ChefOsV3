import { test, expect } from '@playwright/test'

const skipIfNoSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

test.describe('auth-signup', () => {
  test.skip(skipIfNoSupabase, 'Requires Supabase env vars')

  test('validación Zod: passwords no coinciden', async ({ page }) => {
    await page.goto('/signup')
    await page.getByLabel(/nombre completo/i).fill('Test User')
    await page.getByLabel(/^email$/i).fill(`signup-${Date.now()}@chefos.test`)
    await page.getByLabel(/^contraseña/i).fill('Test1234!')
    await page.getByLabel(/confirmar/i).fill('DIFERENTE1234!')
    await page.getByRole('button', { name: /crear cuenta/i }).click()

    await expect(page.getByText(/no coinciden/i)).toBeVisible({ timeout: 5_000 })
  })

  test('password débil (sin números) muestra error', async ({ page }) => {
    await page.goto('/signup')
    await page.getByLabel(/nombre completo/i).fill('Test User')
    await page.getByLabel(/^email$/i).fill(`signup-weak-${Date.now()}@chefos.test`)
    await page.getByLabel(/^contraseña/i).fill('sololetras')
    await page.getByLabel(/confirmar/i).fill('sololetras')
    await page.getByRole('button', { name: /crear cuenta/i }).click()

    await expect(page.getByText(/incluir números/i)).toBeVisible({ timeout: 5_000 })
  })

  test('signup con email único termina en success state', async ({ page }) => {
    const uniqueEmail = `signup-ok-${Date.now()}@chefos.test`
    await page.goto('/signup')
    await page.getByLabel(/nombre completo/i).fill('Test User')
    await page.getByLabel(/^email$/i).fill(uniqueEmail)
    await page.getByLabel(/^contraseña/i).fill('Test1234!')
    await page.getByLabel(/confirmar/i).fill('Test1234!')
    await page.getByRole('button', { name: /crear cuenta/i }).click()

    await expect(page.getByRole('heading', { name: /cuenta creada/i })).toBeVisible({
      timeout: 10_000,
    })
  })
})
