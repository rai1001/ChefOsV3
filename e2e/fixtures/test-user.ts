import { expect, type Page } from '@playwright/test'

export const TEST_USER_EMAIL = process.env.E2E_TEST_USER_EMAIL ?? 'e2e+sprint01@chefos.test'
export const TEST_USER_PASSWORD = process.env.E2E_TEST_USER_PASSWORD ?? 'Test-1234!'
export const TEST_USER_FULL_NAME = 'E2E Test User'

/**
 * Helper para login programático en specs E2E.
 * Redirige a `/` o `/no-access` dependiendo de si el usuario tiene hotel activo.
 */
export async function loginAs(
  page: Page,
  email: string = TEST_USER_EMAIL,
  password: string = TEST_USER_PASSWORD
): Promise<void> {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/contraseña/i).fill(password)
  await page.getByRole('button', { name: /entrar/i }).click()

  // Tras signIn: redirect a / (protected) o /no-access si no hay hotel activo
  await expect(page).toHaveURL(/\/(no-access)?$/, { timeout: 10_000 })
}
