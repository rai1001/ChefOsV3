import { z } from 'zod'

/**
 * Zod 4 `.uuid()` aplica RFC 4122 estricto (version + variant bits).
 * Rechaza UUIDs demo/test (ej. `22222222-2222-2222-2222-222222222222`) que
 * Postgres acepta sin problema, lo que rompe seeds y fixtures heredados de v2.
 *
 * Este helper valida formato canónico 8-4-4-4-12 hex sin imponer version/variant
 * — consistente con la columna `uuid` de Postgres y con el comportamiento de
 * v3_check_membership/RLS basadas en igualdad textual.
 *
 * Regla repo: usar `uuidString()` en vez de `z.string().uuid()` en todos los
 * schemas de aplicación (`feedback_zod4_uuid_strict.md`).
 */
const UUID_LOOSE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

export const uuidString = () => z.string().regex(UUID_LOOSE, 'Invalid UUID')
