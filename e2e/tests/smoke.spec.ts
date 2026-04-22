import { test, expect } from '@playwright/test'

test.describe('smoke', () => {
  test('/login renderiza el formulario de entrada', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /entrar/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/contraseña/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /entrar/i })).toBeEnabled()
  })
})
