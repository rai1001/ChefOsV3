import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('v3_resolve_ingredient_mapping_bulk migration', () => {
  it('redacta errores internos en la RPC v3 activa mediante migracion forward', () => {
    const migrationPath = resolve(
      process.cwd(),
      'supabase/migrations/00086_v3_resolve_mapping_error_redaction.sql'
    )

    expect(existsSync(migrationPath)).toBe(true)

    const migration = readFileSync(migrationPath, 'utf8')
    expect(migration).toContain(
      'create or replace function public.v3_resolve_ingredient_mapping_bulk'
    )
    expect(migration).toContain('perform public.v3_check_membership')
    expect(migration).not.toContain('SQLERRM')
    expect(migration).not.toContain("'error'")
  })
})
