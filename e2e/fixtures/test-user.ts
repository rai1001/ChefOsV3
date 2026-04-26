import { expect, type Page } from '@playwright/test'

export const TEST_USER_EMAIL = process.env.E2E_TEST_USER_EMAIL ?? 'e2e+sprint01@chefos.test'
export const TEST_USER_PASSWORD = process.env.E2E_TEST_USER_PASSWORD ?? 'Test-1234!'
export const TEST_USER_FULL_NAME = 'E2E Test User'

/**
 * Helper para login programático en specs E2E.
 * Tras signIn redirige a uno de tres destinos válidos:
 *   - `/` cuando el usuario tiene hotel activo.
 *   - `/no-access` cuando no tiene memberships visibles.
 *   - `/onboarding` cuando está autenticado pero aún no ha creado hotel.
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

  await expect(page).toHaveURL(/\/(no-access|onboarding)?$/, { timeout: 10_000 })
}
