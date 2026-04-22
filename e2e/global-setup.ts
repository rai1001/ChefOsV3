import { createClient } from '@supabase/supabase-js'
import { TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_USER_FULL_NAME } from './fixtures/test-user'

/**
 * Global setup de Playwright para sprint-01-identity.
 *
 * Crea (idempotente) un usuario de test con email confirmado usando `service_role`.
 * Si `E2E_SKIP_SEED=1` o faltan env vars, no hace nada y los tests que requieran
 * Supabase real fallarán con mensaje claro en lugar de colgar.
 */
export default async function globalSetup() {
  if (process.env.E2E_SKIP_SEED === '1') {
    console.log('[e2e] Skipping global setup (E2E_SKIP_SEED=1)')
    return
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.warn(
      '[e2e] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing — seed skipped. Tests que requieran auth real se saltarán.'
    )
    return
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const existing = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
  const alreadyExists = existing.data.users.some((u) => u.email === TEST_USER_EMAIL)

  if (alreadyExists) {
    console.log(`[e2e] Test user already exists: ${TEST_USER_EMAIL}`)
    return
  }

  const { error } = await admin.auth.admin.createUser({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: TEST_USER_FULL_NAME },
  })

  if (error) {
    console.error('[e2e] Failed to create test user:', error.message)
    throw error
  }

  console.log(`[e2e] Seeded test user: ${TEST_USER_EMAIL}`)
}
