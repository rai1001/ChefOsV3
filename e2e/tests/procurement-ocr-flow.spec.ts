import path from 'node:path'
import { test, expect } from '@playwright/test'
import { loginAs } from '../fixtures/test-user'

const skipIfNoSupabase =
  !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const skipIfNoLiveOcr = process.env.OCR_E2E_LIVE !== '1'

test.describe('procurement OCR flow', () => {
  test.skip(skipIfNoSupabase, 'Requires Supabase env vars')
  test.skip(skipIfNoLiveOcr, 'Set OCR_E2E_LIVE=1 after migrations 00068-00070 are applied')

  test('upload UI, mocked extraction endpoint and review queue route are reachable', async ({
    page,
  }) => {
    await loginAs(page)

    await page.route('**/functions/v1/v3-procurement-ocr-extract', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ jobId: 'mock-job-id', status: 'extracted' }),
      })
    })

    await page.goto('/procurement/ocr/upload')
    await expect(page).toHaveURL(/\/(procurement\/ocr\/upload|onboarding)/)
    if (page.url().includes('/onboarding')) return

    await expect(page.getByRole('heading', { name: /ocr compras/i })).toBeVisible()
    await page
      .locator('input[type="file"]')
      .setInputFiles(path.join(process.cwd(), 'e2e/fixtures/factura-demo.pdf'))
    await expect(page.getByRole('button', { name: /subir y extraer/i })).toBeVisible()

    await page.goto('/procurement/ocr/jobs')
    await expect(page.getByRole('heading', { name: /cola ocr/i })).toBeVisible()
  })
})
